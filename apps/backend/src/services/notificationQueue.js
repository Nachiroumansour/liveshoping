const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

class NotificationQueueService {
  constructor() {
    this.queue = null;
    this.worker = null;
    this.queueEvents = null;
    this.isInitialized = false;
    
    // Configuration Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  async initialize(notificationService) {
    if (this.isInitialized) {
      console.log('⚠️  NotificationQueue déjà initialisé');
      return;
    }

    try {
      // Créer la queue
      this.queue = new Queue('notifications', {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000 // 5 secondes de base
          },
          removeOnComplete: {
            age: 24 * 3600, // Garder 24h
            count: 1000 // Max 1000 jobs complétés
          },
          removeOnFail: {
            age: 7 * 24 * 3600 // Garder 7 jours pour debug
          }
        }
      });

      // Créer le worker pour traiter les jobs
      this.worker = new Worker('notifications', async (job) => {
        const { sellerId, type, data, notificationId } = job.data;
        
        console.log(`🔄 [BullMQ] Traitement notification ${notificationId} (tentative ${job.attemptsMade + 1}/${job.opts.attempts})`);
        
        try {
          // Tenter l'envoi via Socket.IO
          const sent = await notificationService.attemptRealtimeSend(sellerId, type, data);
          
          if (sent) {
            console.log(`✅ [BullMQ] Notification ${notificationId} envoyée avec succès`);
            
            // Mettre à jour la notification en DB
            const { Notification } = require('../models');
            await Notification.update(
              { sent: true, sent_at: new Date() },
              { where: { id: notificationId } }
            );
            
            return { success: true, notificationId };
          } else {
            throw new Error('Vendeur non connecté');
          }
        } catch (error) {
          console.error(`❌ [BullMQ] Erreur traitement notification ${notificationId}:`, error.message);
          throw error; // Relancer pour déclencher le retry
        }
      }, {
        connection: this.connection,
        concurrency: 10, // Traiter 10 jobs en parallèle
        limiter: {
          max: 100, // Max 100 jobs
          duration: 1000 // Par seconde
        }
      });

      // Événements du worker
      this.worker.on('completed', (job) => {
        console.log(`✅ [BullMQ] Job ${job.id} complété`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ] Job ${job.id} échoué après ${job.attemptsMade} tentatives:`, err.message);
      });

      this.worker.on('error', (err) => {
        console.error('❌ [BullMQ] Erreur worker:', err);
      });

      // Événements de la queue
      this.queueEvents = new QueueEvents('notifications', {
        connection: this.connection
      });

      this.queueEvents.on('completed', ({ jobId }) => {
        console.log(`📊 [BullMQ] Job ${jobId} terminé avec succès`);
      });

      this.queueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`📊 [BullMQ] Job ${jobId} échoué:`, failedReason);
      });

      this.isInitialized = true;
      console.log('✅ NotificationQueue BullMQ initialisé');
      
      // Afficher les stats
      await this.logStats();
      
    } catch (error) {
      console.error('❌ Erreur initialisation NotificationQueue:', error);
      console.warn('⚠️  Le système fonctionnera sans queue persistante');
    }
  }

  async addNotification(notificationId, sellerId, type, data, priority = 'normal') {
    if (!this.isInitialized || !this.queue) {
      console.warn('⚠️  Queue non initialisée, notification non ajoutée à la queue');
      return null;
    }

    try {
      const job = await this.queue.add(
        'send-notification',
        {
          notificationId,
          sellerId,
          type,
          data,
          timestamp: new Date().toISOString()
        },
        {
          priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
          jobId: `notif-${notificationId}` // ID unique pour éviter les doublons
        }
      );

      console.log(`📋 [BullMQ] Notification ${notificationId} ajoutée à la queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      console.error('❌ [BullMQ] Erreur ajout notification à la queue:', error);
      return null;
    }
  }

  async getStats() {
    if (!this.queue) return null;

    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
        this.queue.getDelayedCount()
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats queue:', error);
      return null;
    }
  }

  async logStats() {
    const stats = await this.getStats();
    if (stats) {
      console.log('📊 [BullMQ] Stats queue:', stats);
    }
  }

  async cleanOldJobs() {
    if (!this.queue) return;

    try {
      await this.queue.clean(24 * 3600 * 1000, 1000, 'completed'); // Nettoyer jobs complétés > 24h
      await this.queue.clean(7 * 24 * 3600 * 1000, 1000, 'failed'); // Nettoyer jobs échoués > 7j
      console.log('✅ [BullMQ] Anciens jobs nettoyés');
    } catch (error) {
      console.error('❌ [BullMQ] Erreur nettoyage jobs:', error);
    }
  }

  async close() {
    try {
      if (this.worker) {
        await this.worker.close();
        console.log('✅ [BullMQ] Worker fermé');
      }
      if (this.queueEvents) {
        await this.queueEvents.close();
        console.log('✅ [BullMQ] QueueEvents fermé');
      }
      if (this.queue) {
        await this.queue.close();
        console.log('✅ [BullMQ] Queue fermée');
      }
      if (this.connection) {
        await this.connection.quit();
        console.log('✅ [BullMQ] Connexion Redis fermée');
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ Erreur fermeture NotificationQueue:', error);
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasQueue: !!this.queue,
      hasWorker: !!this.worker,
      connectionReady: this.connection?.status === 'ready'
    };
  }
}

// Instance singleton
const notificationQueue = new NotificationQueueService();

module.exports = notificationQueue;

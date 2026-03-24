import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MessageCircle, Star, Package } from 'lucide-react';
import { getApiUrl } from '../config/domains';

const CommentsPage = () => {
  const { linkId, orderId: urlOrderId } = useParams();
  const navigate = useNavigate();
  
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderId, setOrderId] = useState(urlOrderId || '');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [linkId]);

  const loadComments = async () => {
    try {
      const apiUrl = getApiUrl(`/public/${linkId}/comments`);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || !customerName.trim() || (!orderId.trim() && !urlOrderId)) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Utiliser l'orderId de l'URL s'il est disponible
    const finalOrderId = urlOrderId || orderId.trim();

    try {
      setSubmitting(true);
      setError(null);
      
      const apiUrl = getApiUrl(`/public/${linkId}/comments`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment.trim(),
          customerName: customerName.trim(),
          orderId: finalOrderId,
          rating: rating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du commentaire');
      }

      setSuccess(true);
      setComment('');
      setCustomerName('');
      setOrderId('');
      setRating(5);
      
      // Recharger les commentaires
      await loadComments();
      
      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/${linkId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              💬 Commentaires et Avis
            </h1>
            <p className="text-gray-600">
              Partagez votre expérience après votre commande
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de commentaire */}
          <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                Ajouter un commentaire
            </CardTitle>
            <CardDescription>
                Vous devez avoir commandé pour pouvoir commenter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">Commentaire ajouté avec succès !</p>
                </div>
              )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>

                {!urlOrderId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de commande *
                    </label>
                    <Input
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="ID de votre commande"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Trouvez cet ID dans votre confirmation de commande
                    </p>
                  </div>
                )}

                {urlOrderId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Commande #{urlOrderId}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Vous commentez cette commande spécifique
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    {renderStars(rating)}
                    <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre commentaire *
                  </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience, questions ou suggestions..."
                  rows={4}
                    required
                />
              </div>

              <Button 
                type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le commentaire
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

          {/* Liste des commentaires */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Avis des clients
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun commentaire
                  </h3>
                  <p className="text-gray-500">
                    Soyez le premier à partager votre expérience !
                  </p>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Commande #{comment.order?.id}
                        </span>
              </div>
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          {renderStars(comment.rating)}
            </div>
                      )}
            </div>

                    <p className="text-gray-900 mb-2">{comment.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Par {comment.customer_name}</span>
                      <span>{new Date(comment.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;


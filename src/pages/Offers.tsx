'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StatsCards } from '../components/stats-cards'
import { OffersFilter } from '../components/offers-filter'
import { Clock, Coins, GamepadIcon, ClipboardList, ListTodoIcon } from 'lucide-react'
import type { Offer, UserStats } from '../types/offers'

const sampleOffers: Offer[] = [
  {
    id: '1',
    title: 'Play Game X',
    description: 'Play Game X and earn rewards',
    category: 'games',
    image_file: '/images/try.jpg',
    reward: 2.5,
    is_active: true,
    estimated_time: '10 mins',
    link: '#',
    created_at: new Date().toISOString(),
    requirements: ['Must be 18+', 'Complete tutorial']
  },
  {
    id: '2',
    title: 'Complete Survey Y',
    description: 'Complete Survey Y for instant rewards',
    category: 'surveys',
    image_file: '/images/try.jpg',
    reward: 1.0,
    is_active: true,
    estimated_time: '5 mins',
    link: '#',
    created_at: new Date().toISOString(),
  }
];

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await Promise.all([
            fetchOffers(),
            fetchUserStats(user.id)
          ])
        } else {
          // For development, load sample offers
          setOffers(sampleOffers)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    filterOffers()
  }, [offers, activeCategory, searchQuery])

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('reward', { ascending: false });

      if (error) throw error;

      const offersWithLocalImages = data.map((offer: Offer) => ({
        ...offer,
        image_url: `/images/${offer.image_file}`,
      }));

      setOffers(offersWithLocalImages.length ? offersWithLocalImages : sampleOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers(sampleOffers);
      toast({
        title: "Notice",
        description: "Using sample offers for demonstration",
      });
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newStats, error: createError } = await supabase
            .from('user_stats')
            .insert([{
              user_id: userId,
              total_earned: 0,
              completed_offers: 0,
              current_streak: 0
            }])
            .select()
            .single()

          if (createError) throw createError
          setUserStats(newStats)
        } else {
          throw error
        }
      } else {
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error handling user stats:', error)
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      })
    }
  }

  const trackOfferClick = async (offerId, reward) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to start offers",
          variant: "destructive"
        });
        return;
      }

      const randomizedReward = reward * (Math.random() * 0.5 + 0.75);

      await supabase
        .from('offer_clicks')
        .insert([{
          user_id: user.id,
          offer_id: offerId,
          ip_address: '0.0.0.0',
          user_agent: navigator.userAgent
        }]);

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const { total_earned, completed_offers } = data;
        const newTotalEarned = total_earned + randomizedReward;
        const newCompletedOffers = completed_offers + 1;

        await supabase
          .from('user_stats')
          .update({
            total_earned: newTotalEarned,
            completed_offers: newCompletedOffers
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_stats')
          .insert([{
            user_id: user.id,
            total_earned: randomizedReward,
            completed_offers: 1,
            current_streak: 0
          }]);
      }

    } catch (error) {
      console.error('Error tracking offer click:', error);
    }
  }

  const filterOffers = () => {
    let filtered = [...offers]

    if (activeCategory !== 'All') {
      filtered = filtered.filter(offer =>
        offer.category.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOffers(filtered)
  }

  const handleOfferClick = async (offer) => {
    await trackOfferClick(offer.id, offer.reward);
    window.open(offer.link, '_blank');
    toast({
      title: "Offer Started",
      description: `You've started: ${offer.title}. Complete it to earn $${offer.reward.toFixed(2)}!`,
    });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-hite-900 via-purple-900 to-violet-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Offer Wall</h1>
            {userStats && <StatsCards stats={userStats} />}
          </div>

          <OffersFilter
            onFilterChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
          />

          {/* Offer Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <GamepadIcon className="mr-2" /> Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Play games and earn rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ClipboardList className="mr-2" /> Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Complete surveys for instant rewards</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ListTodoIcon className="mr-2" /> Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Complete task and Gain Rewards</p>
              </CardContent>
            </Card>

          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden backdrop-blur bg-card/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <div className="relative h-48 overflow-hidden bg-purple-800">
                    {offer.image_file ? (
                      <img
                        src={offer.image_file}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-900">
                        {offer.category === 'games' ? (
                          <GamepadIcon className="w-20 h-20 text-purple-300" />
                        ) : offer.category === 'surveys' ? (
                          <ClipboardList className="w-20 h-20 text-purple-300" />
                        ) : offer.category === 'tasks' ? (
                          <ListTodoIcon className="w-20 h-20 text-purple-300" />
                        ) : null} {/* Add a fallback if needed */}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{offer.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{offer.description}</p>
                    {offer.requirements && (
                      <ul className="space-y-2">
                        {offer.requirements.map((req, i) => (
                          <li key={i} className="text-sm text-white-400">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between text-sm text-white-400">
                      {offer.estimated_time && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{offer.estimated_time}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Coins className="w-4 h-4 mr-1" />
                        <span className="font-semibold text-white">
                          ${offer.reward.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleOfferClick(offer)}
                    >
                      Start Offer
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Offers
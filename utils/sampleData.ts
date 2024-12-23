// src/utils/sampleData.ts
// (renamed from uploadSampleImages.ts since we're no longer uploading)

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  reward: number;
  category: string;
  link: string;
  is_active: boolean;
  created_at: string;
  requirements?: string[];
  estimated_time?: string;
}

// Function to get sample data with local images
export const getSampleOffers = (): Offer[] => {
  return [
    {
      id: '1',
      title: 'Adventure Quest',
      description: 'Embark on an epic journey through mystical lands',
      image_url: '/images/try.jpg', // Local image path from public folder
      reward: 5.00,
      category: 'games',
      link: 'https://example.com/game1',
      requirements: ['Reach level 10', 'Complete tutorial'],
      estimated_time: '30 mins',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Market Research Survey',
      description: 'Share your opinion about new products',
      image_url: '/images/surveys/survey1.png', // Local image path from public folder
      reward: 2.50,
      category: 'surveys',
      link: 'https://example.com/survey1',
      requirements: ['Complete all questions', '10 minutes survey'],
      estimated_time: '10 mins',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Strategy Game Challenge',
      description: 'Test your strategic thinking skills',
      image_url: '/images/games/game2.png', // Local image path from public folder
      reward: 3.75,
      category: 'games',
      link: 'https://example.com/game2',
      requirements: ['Complete 3 missions', 'Build your base'],
      estimated_time: '45 mins',
      is_active: true,
      created_at: new Date().toISOString()
    }
    // Add more sample offers as needed
  ];
};
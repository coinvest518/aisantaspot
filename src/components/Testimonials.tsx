import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah J.",
    text: "I've earned over $500 in my first month! This platform is amazing!",
    rating: 5,
    location: "United States"
  },
  {
    name: "Michael R.",
    text: "The referral system is so easy to use. My network keeps growing!",
    rating: 5,
    location: "Canada"
  },
  {
    name: "Emma P.",
    text: "Best decision I made this year. The community is super supportive!",
    rating: 5,
    location: "UK"
  }
];

const Testimonials = () => {
  return (
    <div className="py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{testimonial.text}</p>
              <div className="flex justify-between items-center">
                <strong>{testimonial.name}</strong>
                <span className="text-sm text-gray-500">{testimonial.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

export function UserButton() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <Button variant="ghost" className="gap-2">
      <UserCircle className="w-5 h-5" />
      <span>{profile.username}</span>
    </Button>
  );
}
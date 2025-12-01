import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UsersRound, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function GameSelectionPage() {
  const games = [
    {
      id: "whos-out",
      name: "مين برا السالفة؟",
      description: "لعبة جماعية ممتعة وفيها ضحك. اكتشفوا من الي برا السالفة!",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary",
      minPlayers: 3,
      maxPlayers: 20,
      route: "/whos-out"
    },
    {
      id: "mafia",
      name: "المافيا",
      description: "لعبة استراتيجية اجتماعية تعتمد على الخداع والتحليل. فريقان متعارضان: المافيا والمدينة.",
      icon: UsersRound,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      minPlayers: 6,
      maxPlayers: 30,
      route: "/mafia",
      comingSoon: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-3 sm:p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">اختر لعبتك</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              مجموعة من الألعاب الجماعية الممتعة
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              اختر اللعبة التي تريد لعبها مع أصدقائك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Card 
                  key={game.id} 
                  className={`border-2 ${game.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105 ${game.comingSoon ? 'opacity-75' : ''}`}
                >
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full ${game.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${game.color}`} />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl mb-2">{game.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>👥 {game.minPlayers} - {game.maxPlayers} لاعب</span>
                    </div>
                    {game.comingSoon ? (
                      <Button 
                        disabled 
                        className="w-full h-12 text-lg"
                        variant="outline"
                      >
                        قريباً
                      </Button>
                    ) : (
                      <Link href={game.route}>
                        <Button 
                          className={`w-full h-12 text-lg ${game.bgColor} ${game.color} hover:opacity-90`}
                          variant="outline"
                        >
                          ابدأ اللعب
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}




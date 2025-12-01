import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UsersRound, Sparkles, Moon, Sun, Gamepad2 } from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";

export default function GameSelectionPage() {
  const games = [
    {
      id: "whos-out",
      name: "مين برا السالفة؟",
      description: "لعبة جماعية ممتعة وفيها ضحك. اكتشفوا من الي برا السالفة!",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-300",
      hoverColor: "hover:border-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      minPlayers: 3,
      maxPlayers: 20,
      route: "/whos-out",
      emoji: "🎯"
    },
    {
      id: "mafia",
      name: "المافيا",
      description: "لعبة استراتيجية اجتماعية تعتمد على الخداع والتحليل. فريقان متعارضان: المافيا والمدينة.",
      icon: UsersRound,
      color: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-red-300",
      hoverColor: "hover:border-red-500",
      buttonColor: "bg-red-600 hover:bg-red-700",
      minPlayers: 6,
      maxPlayers: 30,
      route: "/mafia",
      emoji: "🌙",
      comingSoon: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-10 h-10 sm:w-14 sm:h-14 text-primary animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              اختر لعبتك
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-2 font-medium">
              مجموعة من الألعاب الجماعية الممتعة
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">
              اختر اللعبة التي تريد لعبها مع أصدقائك
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Card 
                  key={game.id} 
                  className={`border-2 ${game.borderColor} ${game.hoverColor} ${game.bgColor} hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${game.comingSoon ? 'opacity-75' : ''} overflow-hidden relative`}
                >
                  {/* Decorative gradient overlay */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${game.bgColor} opacity-20 rounded-full blur-3xl -mr-16 -mt-16`} />
                  
                  <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl ${game.bgColor} flex items-center justify-center shadow-lg border-2 ${game.borderColor} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${game.color}`} />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl sm:text-4xl">{game.emoji}</span>
                      <CardTitle className="text-2xl sm:text-3xl md:text-4xl">{game.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-5 sm:space-y-6 relative z-10">
                    <div className="flex items-center justify-center gap-3 text-sm sm:text-base">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full border border-gray-200">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {game.minPlayers} - {game.maxPlayers} لاعب
                        </span>
                      </div>
                    </div>
                    
                    {game.comingSoon ? (
                      <Button 
                        disabled 
                        className="w-full h-12 sm:h-14 text-base sm:text-lg bg-muted text-muted-foreground cursor-not-allowed"
                        variant="outline"
                      >
                        قريباً
                      </Button>
                    ) : (
                      <Link href={game.route}>
                        <Button 
                          className={`w-full h-12 sm:h-14 text-base sm:text-lg ${game.buttonColor} text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold`}
                        >
                          <span className="ml-2">🎮</span>
                          ابدأ اللعب
                          <span className="mr-2">→</span>
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              💡 نصيحة: يمكنك إنشاء غرفة خاصة أو الانضمام إلى غرفة عامة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Vote, Trophy, Clock, Lightbulb } from "lucide-react";
import { Header } from "@/components/Header";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">مين برا السالفة؟</h1>
          <p className="text-lg text-muted-foreground">لعبة جماعية ممتعة لاكتشاف الغريب بينكم</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                كيف تلعب؟
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Badge variant="default" className="w-8 h-8 flex items-center justify-center p-0">1</Badge>
                <div>
                  <p className="font-semibold">إنشاء أو الانضمام لغرفة</p>
                  <p className="text-sm text-muted-foreground">أنشئ غرفة أو انضم بواسطة الكود</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge variant="default" className="w-8 h-8 flex items-center justify-center p-0">2</Badge>
                <div>
                  <p className="font-semibold">النقاش والحوار</p>
                  <p className="text-sm text-muted-foreground">تحدثوا وافتكروا من الي برا السالفة</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge variant="default" className="w-8 h-8 flex items-center justify-center p-0">3</Badge>
                <div>
                  <p className="font-semibold">التصويت</p>
                  <p className="text-sm text-muted-foreground">صوتوا على من تعتقدون أنه برا السالفة</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge variant="default" className="w-8 h-8 flex items-center justify-center p-0">4</Badge>
                <div>
                  <p className="font-semibold">النتائج</p>
                  <p className="text-sm text-muted-foreground">شوفوا من كان برا السالفة وكم نقطة كسبتوا</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                الهدف من اللعبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                كل لاعب ياخذ كلمة - كلهم نفس الكلمة إلا واحد! الي برا السالفة عنده كلمة مختلفة.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">بالسالفة</Badge>
                  <span className="text-sm">كلهم نفس الكلمة - هدفهم يكتشفون من برا السالفة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">برا السالفة</Badge>
                  <span className="text-sm">عنده كلمة مختلفة - هدفه يخفي نفسه أو يكتشف نفسه</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Vote className="w-5 h-5 text-primary" />
                النقاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">+10 نقطة</span> - إذا صوتت صح على برا السالفة</p>
                <p><span className="font-semibold">+15 نقطة</span> - إذا برا السالفة صوت على نفسه</p>
                <p><span className="font-semibold">+5 نقطة</span> - مكافأة إضافية لبرا السالفة</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                الوقت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">3 دقائق</span> - للنقاش والحوار</p>
                <p><span className="font-semibold">1 دقيقة</span> - للتصويت</p>
                <p className="text-muted-foreground">يمكن للاعبين بدء التصويت مبكراً</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-primary" />
                نصائح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• استمع جيداً لردود اللاعبين</p>
                <p>• برا السالفة حاول يخفي نفسه</p>
                <p>• استخدم المنطق والاستنتاج</p>
                <p>• استمتعوا واتضحكوا!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قواعد اللعبة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• تحتاج 3 لاعبين على الأقل للبدء</li>
              <li>• المضيف (الليدر) يتحكم في إعدادات اللعبة</li>
              <li>• يمكن للمضيف طرد لاعبين أو إنهاء الجولة</li>
              <li>• النقاط تُحسب بعد انتهاء التصويت</li>
              <li>• يمكن لعب عدة جولات متتالية</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



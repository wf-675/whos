import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Room } from "@shared/schema";
import type { WSMessage } from "@shared/schema";

interface GameSettingsProps {
  room: Room;
  isHost: boolean;
  onSendMessage: (message: WSMessage) => void;
}

export function GameSettings({ room, isHost, onSendMessage }: GameSettingsProps) {
  const [open, setOpen] = useState(false);
  const [allowReveal, setAllowReveal] = useState(room.settings?.allowOddOneOutReveal || false);
  const [enableTimer, setEnableTimer] = useState(room.settings?.enableTimer ?? true);
  const [discussionTime, setDiscussionTime] = useState(room.settings?.discussionTimeMinutes || 3);
  const [category, setCategory] = useState(room.settings?.category || "random");
  const [excludedCategories, setExcludedCategories] = useState<string[]>(room.settings?.excludedCategories || []);

  // Update state when room settings change
  useEffect(() => {
    if (room.settings) {
      setAllowReveal(room.settings.allowOddOneOutReveal || false);
      setEnableTimer(room.settings.enableTimer ?? true);
      setDiscussionTime(room.settings.discussionTimeMinutes || 3);
      setCategory(room.settings.category || "random");
      setExcludedCategories(room.settings.excludedCategories || []);
    }
  }, [room.settings]);

  if (!isHost) return null;

  const handleSave = () => {
    const settingsData: any = {
      allowOddOneOutReveal: allowReveal,
      enableTimer,
      discussionTimeMinutes: discussionTime,
    };
    
    // Only send category if not random
    if (category !== "random") {
      settingsData.category = category;
      settingsData.excludedCategories = [];
    } else {
      // For random, send undefined for category and excludedCategories
      settingsData.category = undefined;
      settingsData.excludedCategories = excludedCategories;
    }
    
    onSendMessage({
      type: 'update_settings',
      data: settingsData
    });
    setOpen(false);
  };

  const toggleExcludedCategory = (cat: string) => {
    if (excludedCategories.includes(cat)) {
      setExcludedCategories(excludedCategories.filter(c => c !== cat));
    } else {
      setExcludedCategories([...excludedCategories, cat]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 ml-2" />
          إعدادات اللعبة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إعدادات اللعبة</DialogTitle>
          <DialogDescription>
            تحكم في إعدادات الجولة القادمة
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reveal">هل برا السالفة يعرف نفسه؟</Label>
              <p className="text-sm text-muted-foreground">
                إذا كان مفعلاً، برا السالفة يعرف أنه برا السالفة
              </p>
            </div>
            <Switch
              id="reveal"
              checked={allowReveal}
              onCheckedChange={setAllowReveal}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="timer">تفعيل التايمر</Label>
              <p className="text-sm text-muted-foreground">
                تايمر تلقائي للنقاش
              </p>
            </div>
            <Switch
              id="timer"
              checked={enableTimer}
              onCheckedChange={setEnableTimer}
            />
          </div>

          {enableTimer && (
            <div className="space-y-2">
              <Label htmlFor="discussion-time">وقت النقاش (بالدقائق)</Label>
              <Input
                id="discussion-time"
                type="number"
                min="1"
                max="10"
                value={discussionTime}
                onChange={(e) => setDiscussionTime(Math.max(1, Math.min(10, parseInt(e.target.value) || 3)))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                وقت التصويت ثابت (1 دقيقة)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">الكاتقوري</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">عشوائي</SelectItem>
                <SelectItem value="animals">حيوانات</SelectItem>
                <SelectItem value="food">أكل</SelectItem>
                <SelectItem value="countries">دول</SelectItem>
                <SelectItem value="sports">رياضة</SelectItem>
                <SelectItem value="professions">مهن</SelectItem>
                <SelectItem value="players">لاعبين</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              اختر كاتقوري معين أو اتركه عشوائي
            </p>
          </div>

          {category === "random" && (
            <div className="space-y-2">
              <Label>استثناء كاتقوريات من العشوائي</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {['animals', 'food', 'countries', 'sports', 'professions', 'players'].map((cat) => {
                  const catNames: Record<string, string> = {
                    animals: 'حيوانات',
                    food: 'أكل',
                    countries: 'دول',
                    sports: 'رياضة',
                    professions: 'مهن',
                    players: 'لاعبين',
                  };
                  return (
                    <div key={cat} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`exclude-${cat}`}
                        checked={excludedCategories.includes(cat)}
                        onCheckedChange={() => toggleExcludedCategory(cat)}
                      />
                      <label
                        htmlFor={`exclude-${cat}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {catNames[cat]}
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                اختر الكاتقوريات التي تريد استثناءها من الاختيار العشوائي
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


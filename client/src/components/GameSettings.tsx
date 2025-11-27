import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [category, setCategory] = useState(room.settings?.category || "random");

  // Update state when room settings change
  useEffect(() => {
    if (room.settings) {
      setAllowReveal(room.settings.allowOddOneOutReveal || false);
      setEnableTimer(room.settings.enableTimer ?? true);
      setCategory(room.settings.category || "random");
    }
  }, [room.settings]);

  if (!isHost) return null;

  const handleSave = () => {
    onSendMessage({
      type: 'update_settings',
      data: {
        allowOddOneOutReveal: allowReveal,
        enableTimer,
        category: category === "random" ? undefined : category,
      }
    });
    setOpen(false);
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
                تايمر تلقائي للنقاش والتصويت
              </p>
            </div>
            <Switch
              id="timer"
              checked={enableTimer}
              onCheckedChange={setEnableTimer}
            />
          </div>

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
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              اختر كاتقوري معين أو اتركه عشوائي
            </p>
          </div>

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


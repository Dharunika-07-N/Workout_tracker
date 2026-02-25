import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Scale, Ruler, Calendar, Dumbbell, Save, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const ProfilePage = () => {
    const { profile, setProfile } = useAppState();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        height: profile?.height || 170,
        weight: profile?.weight || 70,
        age: profile?.age || 25,
        gender: profile?.gender || 'other',
        targetWeight: profile?.targetWeight || 65,
        equipment: profile?.equipment || [],
    });
    const [allEquipment, setAllEquipment] = useState<{ id: string; name: string }[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.equipment.list().then(setAllEquipment).catch(console.error);
    }, []);

    const handleSave = async () => {
        await setProfile(formData as any);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggleEquipment = (name: string) => {
        setFormData(prev => ({
            ...prev,
            equipment: prev.equipment.includes(name)
                ? prev.equipment.filter(e => e !== name)
                : [...prev.equipment, name]
        }));
    };

    return (
        <div className="container max-w-4xl py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your physical stats and equipment preferences.</p>
                    </div>
                    <Button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        size="lg"
                        className={saved ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        {saved ? <CheckCircle2 className="w-5 h-5 mr-2" /> : editing ? <Save className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
                        {saved ? "Saved!" : editing ? "Save Changes" : "Edit Profile"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Physical Stats */}
                    <Card className="md:col-span-2 overflow-hidden border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scale className="w-5 h-5 text-primary" />
                                Physical Attributes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Ruler className="w-4 h-4" /> Height (cm)
                                </Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={formData.height}
                                        onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                                    />
                                ) : (
                                    <p className="text-2xl font-semibold">{profile?.height} cm</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Scale className="w-4 h-4" /> Weight (kg)
                                </Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                                    />
                                ) : (
                                    <p className="text-2xl font-semibold">{profile?.weight} kg</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" /> Age
                                </Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                    />
                                ) : (
                                    <p className="text-2xl font-semibold">{profile?.age} years</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    Target Weight (kg)
                                </Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={formData.targetWeight}
                                        onChange={e => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                                    />
                                ) : (
                                    <p className="text-2xl font-semibold text-primary">{profile?.targetWeight} kg</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Bio/Quick Card */}
                    <Card className="border-border bg-gradient-to-br from-primary/10 to-background">
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
                                <User className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Athlete</h3>
                                <p className="text-sm text-muted-foreground capitalize">{profile?.gender || 'not set'}</p>
                            </div>
                            <div className="w-full pt-4 border-t border-primary/20 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current BMI</span>
                                    <span className="font-medium">
                                        {profile ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : '--'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Equipment */}
                    <Card className="md:col-span-3 border-border bg-card/50">
                        <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-primary" />
                                Gym Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-3">
                                {editing ? (
                                    allEquipment.map(eq => (
                                        <Button
                                            key={eq.id}
                                            variant={formData.equipment.includes(eq.name) ? "default" : "outline"}
                                            onClick={() => toggleEquipment(eq.name)}
                                            className="rounded-full"
                                        >
                                            {eq.name}
                                        </Button>
                                    ))
                                ) : (
                                    profile?.equipment.map(eq => (
                                        <Badge key={eq} variant="secondary" className="px-4 py-1.5 text-sm rounded-full">
                                            {eq}
                                        </Badge>
                                    )) || <p className="text-muted-foreground">No equipment selected.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;

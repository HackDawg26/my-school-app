
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/card";
import { Button } from "../../../components/components/button";
import { Input } from "../../../components/components/input";
import { Label } from "../../../components/components/label";
import { student } from "../../../components/lib/data";

export default function SettingsPage() {
    return (
        <main className="flex-1 p-4 md:p-6">
             <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>
            <div className="max-w-2xl mx-auto grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Profile</CardTitle>
                        <CardDescription>Manage your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={student.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input id="studentId" defaultValue={student.id} readOnly />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Account</CardTitle>
                        <CardDescription>Update your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue="j.delacruz@claroed.edu" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Change Password</Label>
                            <Input id="password" type="password" placeholder="New Password" />
                        </div>
                         <Button>Update Settings</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

import { AdminConfig } from "@/components/organisms/AdminConfig";
import { useDojo } from "@/lib/dojo/DojoProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
    const { world } = useDojo();
    const router = useRouter();

    useEffect(() => {
        // Check if user is admin
        const checkAdmin = async () => {
            try {
                const isAdmin = await world.execute("lyricsflip::systems::config::check_caller_is_admin", []);
                if (!isAdmin) {
                    router.push("/");
                }
            } catch (error) {
                router.push("/");
            }
        };
        checkAdmin();
    }, [world, router]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <AdminConfig />
        </div>
    );
} 
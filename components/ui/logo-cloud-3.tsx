import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Logo = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
    logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
    return (
        <div
            {...props}
            className={cn(
                "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
                className
            )}
        >
            <InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
                {logos.map((logo) => (
                    <div key={`logo-${logo.alt}`} className="relative h-4 md:h-5 w-24 md:w-32 pointer-events-none select-none dark:brightness-0 dark:invert">
                        <Image
                            alt={logo.alt}
                            fill
                            className="object-contain"
                            src={logo.src}
                        />
                    </div>
                ))}
            </InfiniteSlider>
        </div>
    );
}

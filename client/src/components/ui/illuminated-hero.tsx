import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function IlluminatedHero() {
    return (
        <div className="relative w-full flex min-h-screen flex-wrap items-center justify-center overflow-hidden bg-black text-[calc(var(--size)*0.022)] text-white [--factor:min(1000px,100vh)] [--size:min(var(--factor),100vw)] py-20">
            <div className="bg absolute h-full w-full max-w-[44em]">
                <div className="shadow-bgt absolute size-full translate-[0_-70%] scale-[1.2] animate-[onloadbgt_1s_ease-in-out_forwards] rounded-[100em] opacity-60" />
                <div className="shadow-bgb absolute size-full translate-[0_-70%] scale-[1.2] animate-[onloadbgb_1s_ease-in-out_forwards] rounded-[100em] opacity-60" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="text-center text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-200 mb-8" aria-label="Think It. Agents Build It.">
                    <span className="block mb-2">Think It.</span>
                    <span
                        className={cn(
                            'relative inline-block',
                            'before:absolute before:animate-[onloadopacity_1s_ease-out_forwards] before:opacity-0 before:content-[attr(data-text)]',
                            'before:bg-gradient-to-b before:from-orange-300 before:via-orange-400 before:to-orange-500 before:bg-clip-text before:text-transparent',
                            'filter-[url(#glow-4)]',
                        )}
                        data-text="Agents Build It."
                    >
                        <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">
                            Agents Build It.
                        </span>
                    </span>
                    <span className="block mt-2 text-2xl md:text-3xl lg:text-4xl text-gray-300">
                        Deploy in Minutes, Not Weeks.
                    </span>
                </div>

                <p className="max-w-3xl mx-auto text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-10 text-center">
                    Describe your app in plain English. Our <span className="font-bold text-orange-400">autonomous AI agents</span> handle deployment, monitoring, and auto-recovery—so you can focus on building your vision.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Button
                        size="lg"
                        className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        asChild
                    >
                        <a href="/dashboard">Start Building Free</a>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="px-8 py-6 text-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold border-white/30 hover:border-white/50 transition-all duration-200"
                        asChild
                    >
                        <a href="#features">See How It Works</a>
                    </Button>
                </div>

                <p className="text-center text-sm md:text-base text-gray-400">
                    <span className="font-semibold text-orange-400">$49/month</span> replaces a <span className="line-through text-gray-500">$140,000/year</span> DevOps engineer
                </p>
            </div>

            <svg
                className="absolute -z-1 h-0 w-0"
                width="1440px"
                height="300px"
                viewBox="0 0 1440 300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter
                        id="glow-4"
                        colorInterpolationFilters="sRGB"
                        x="-50%"
                        y="-200%"
                        width="200%"
                        height="500%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            data-target-blur="4"
                            stdDeviation="4"
                            result="blur4"
                        />
                        <feGaussianBlur
                            in="SourceGraphic"
                            data-target-blur="19"
                            stdDeviation="19"
                            result="blur19"
                        />
                        <feGaussianBlur
                            in="SourceGraphic"
                            data-target-blur="9"
                            stdDeviation="9"
                            result="blur9"
                        />
                        <feGaussianBlur
                            in="SourceGraphic"
                            data-target-blur="30"
                            stdDeviation="30"
                            result="blur30"
                        />
                        <feColorMatrix
                            in="blur4"
                            result="color-0-blur"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0.9803921568627451 0 0 0
                      0 0 0.9647058823529412 0 0
                      0 0 0 0.8 0"
                        />
                        <feOffset
                            in="color-0-blur"
                            result="layer-0-offsetted"
                            dx="0"
                            dy="0"
                            data-target-offset-y="0"
                        />
                        <feColorMatrix
                            in="blur19"
                            result="color-1-blur"
                            type="matrix"
                            values="0.8156862745098039 0 0 0 0
                      0 0.49411764705882355 0 0 0
                      0 0 0.2627450980392157 0 0
                      0 0 0 1 0"
                        />
                        <feOffset
                            in="color-1-blur"
                            result="layer-1-offsetted"
                            dx="0"
                            dy="2"
                            data-target-offset-y="2"
                        />
                        <feColorMatrix
                            in="blur9"
                            result="color-2-blur"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0.6666666666666666 0 0 0
                      0 0 0.36470588235294116 0 0
                      0 0 0 0.65 0"
                        />
                        <feOffset
                            in="color-2-blur"
                            result="layer-2-offsetted"
                            dx="0"
                            dy="2"
                            data-target-offset-y="2"
                        />
                        <feColorMatrix
                            in="blur30"
                            result="color-3-blur"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0.611764705882353 0 0 0
                      0 0 0.39215686274509803 0 0
                      0 0 0 1 0"
                        />
                        <feOffset
                            in="color-3-blur"
                            result="layer-3-offsetted"
                            dx="0"
                            dy="2"
                            data-target-offset-y="2"
                        />
                        <feColorMatrix
                            in="blur30"
                            result="color-4-blur"
                            type="matrix"
                            values="0.4549019607843137 0 0 0 0
                      0 0.16470588235294117 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                        />
                        <feOffset
                            in="color-4-blur"
                            result="layer-4-offsetted"
                            dx="0"
                            dy="16"
                            data-target-offset-y="16"
                        />
                        <feColorMatrix
                            in="blur30"
                            result="color-5-blur"
                            type="matrix"
                            values="0.4235294117647059 0 0 0 0
                      0 0.19607843137254902 0 0 0
                      0 0 0.11372549019607843 0 0
                      0 0 0 1 0"
                        />
                        <feOffset
                            in="color-5-blur"
                            result="layer-5-offsetted"
                            dx="0"
                            dy="64"
                            data-target-offset-y="64"
                        />
                        <feColorMatrix
                            in="blur30"
                            result="color-6-blur"
                            type="matrix"
                            values="0.21176470588235294 0 0 0 0
                      0 0.10980392156862745 0 0 0
                      0 0 0.07450980392156863 0 0
                      0 0 0 1 0"
                        />
                        <feOffset
                            in="color-6-blur"
                            result="layer-6-offsetted"
                            dx="0"
                            dy="64"
                            data-target-offset-y="64"
                        />
                        <feColorMatrix
                            in="blur30"
                            result="color-7-blur"
                            type="matrix"
                            values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.68 0"
                        />
                        <feOffset
                            in="color-7-blur"
                            result="layer-7-offsetted"
                            dx="0"
                            dy="64"
                            data-target-offset-y="64"
                        />
                        <feMerge>
                            <feMergeNode in="layer-0-offsetted" />
                            <feMergeNode in="layer-1-offsetted" />
                            <feMergeNode in="layer-2-offsetted" />
                            <feMergeNode in="layer-3-offsetted" />
                            <feMergeNode in="layer-4-offsetted" />
                            <feMergeNode in="layer-5-offsetted" />
                            <feMergeNode in="layer-6-offsetted" />
                            <feMergeNode in="layer-7-offsetted" />
                            <feMergeNode in="layer-0-offsetted" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <style>{`
                @keyframes onloadbgt {
                    from {
                        opacity: 0.6;
                        transform: translate(0, -70%) scale(1.2);
                    }
                    to {
                        opacity: 0.8;
                        transform: translate(0, -50%) scale(1);
                    }
                }

                @keyframes onloadbgb {
                    from {
                        opacity: 0.6;
                        transform: translate(0, 70%) scale(1.2);
                    }
                    to {
                        opacity: 0.8;
                        transform: translate(0, 50%) scale(1);
                    }
                }

                @keyframes onloadopacity {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .shadow-bgt {
                    background: radial-gradient(
                        ellipse at center,
                        #ff6b35 0%,
                        #ff8c42 25%,
                        #ffb84d 50%,
                        transparent 75%
                    );
                }

                .shadow-bgb {
                    background: radial-gradient(
                        ellipse at center,
                        #d0421b 0%,
                        #ff6b35 25%,
                        #ff8c42 50%,
                        transparent 75%
                    );
                }
            `}</style>
        </div>
    );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TierInfo {
  name: string;
  monthlyTokenLimit: number;
  features: string[];
  price: number;
  limitations?: string[];
  benefits?: string[];
}

const TIER_ICONS = {
  free: <Star className="w-6 h-6" />,
  pro: <Zap className="w-6 h-6" />,
  enterprise: <Crown className="w-6 h-6" />
};

const TIER_COLORS = {
  free: "border-gray-200 bg-white",
  pro: "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-500",
  enterprise: "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
};

export default function PricingPage() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<Record<string, TierInfo>>({});
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would come from your API
    setTiers({
      free: {
        name: "Free",
        monthlyTokenLimit: 10000,
        features: [
          "Basic repository analysis",
          "Simple deployment plans", 
          "Community support",
          "Ministral-3B AI model",
          "Limited cloud integrations"
        ],
        price: 0,
        limitations: [
          "Limited to 10K AI tokens per month",
          "Basic AI model (Ministral-3B)",
          "No advanced optimizations",
          "Community support only"
        ]
      },
      pro: {
        name: "Pro",
        monthlyTokenLimit: 1000000,
        features: [
          "Advanced repository analysis with Phi-4",
          "Comprehensive deployment strategies",
          "Multi-cloud infrastructure optimization", 
          "Priority support",
          "Full cloud provider integrations",
          "Cost optimization insights",
          "Advanced monitoring & alerts"
        ],
        price: 29,
        benefits: [
          "100x more AI tokens (1M vs 10K)",
          "Phi-4 reasoning model (vs Ministral-3B)",
          "Advanced multi-cloud strategies",
          "Priority email support",
          "Cost optimization analysis"
        ]
      },
      enterprise: {
        name: "Enterprise",
        monthlyTokenLimit: 10000000,
        features: [
          "Everything in Pro",
          "Custom AI model fine-tuning",
          "Dedicated infrastructure",
          "24/7 phone support",
          "Custom integrations",
          "SLA guarantees",
          "Team collaboration features"
        ],
        price: 299,
        benefits: [
          "10x Pro token limits",
          "Custom AI model training",
          "Dedicated support engineer",
          "99.9% uptime SLA",
          "Custom integrations"
        ]
      }
    });
    setLoading(false);
  }, []);

  const handleUpgrade = async (targetTier: string) => {
    setUpgrading(targetTier);
    
    try {
      // In a real app, integrate with Stripe or your payment processor
      console.log(`Upgrading to ${targetTier}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to payment or show success
      alert(`Upgrade to ${targetTier} initiated! You'll be redirected to payment.`);
      
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  const currentTier = user?.tier || 'free';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Careerate Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the power of AI-driven DevOps with our flexible pricing tiers. 
          From free development to enterprise-scale operations.
        </p>
      </div>

      {/* Current Usage Banner */}
      {user && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Current: {tiers[currentTier]?.name} Plan
                </p>
                <p className="text-sm text-blue-700">
                  {user.tokensRemaining?.toLocaleString() || 0} tokens remaining this month
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-32 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(user.usagePercentage || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {user.usagePercentage || 0}% used
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(tiers).map(([tierKey, tier]) => (
          <Card key={tierKey} className={`relative ${TIER_COLORS[tierKey as keyof typeof TIER_COLORS]}`}>
            {tierKey === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2 text-gray-700">
                {TIER_ICONS[tierKey as keyof typeof TIER_ICONS]}
              </div>
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <CardDescription className="text-lg">
                <span className="text-3xl font-bold text-gray-900">
                  ${tier.price}
                </span>
                {tier.price > 0 && <span className="text-gray-600">/month</span>}
              </CardDescription>
              <p className="text-sm text-gray-600">
                {tier.monthlyTokenLimit.toLocaleString()} tokens/month
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits for paid tiers */}
              {tier.benefits && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-3 h-3 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations for free tier */}
              {tier.limitations && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Limitations</h4>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="text-xs text-gray-500">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4">
              {currentTier === tierKey ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : tierKey === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  Always Free
                </Button>
              ) : (
                <Button 
                  className={`w-full ${tierKey === 'pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  onClick={() => handleUpgrade(tierKey)}
                  disabled={upgrading === tierKey}
                >
                  {upgrading === tierKey ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upgrading...
                    </div>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Model Comparison */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">AI Model Comparison</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Free (Ministral-3B)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pro+ (Phi-4 Reasoning)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Model Cost</td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">$0.004/1M tokens</td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">$0.022/1M tokens</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Reasoning Capability</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">Basic</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Advanced</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Repository Analysis</td>
                <td className="px-6 py-4 text-sm text-center text-yellow-600">Simple</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Comprehensive</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Multi-cloud Strategies</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">❌</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Cost Optimization</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">❌</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">What are tokens?</h3>
            <p className="text-gray-600 text-sm">
              Tokens are units of AI computation. Roughly 750 words = 1,000 tokens. 
              Your monthly limit resets on the same day each month.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600 text-sm">
              Yes! Upgrade anytime. Downgrades take effect at your next billing cycle.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">What's the difference between AI models?</h3>
            <p className="text-gray-600 text-sm">
              Phi-4 reasoning model provides advanced logic and comprehensive analysis, 
              while Ministral-3B offers basic functionality at ultra-low cost.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Need a custom plan? {" "}
          <a href="mailto:sales@careerate.com" className="text-blue-600 hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}
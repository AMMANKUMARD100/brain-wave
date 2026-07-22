import { memo } from 'react';
import { Brain, Cloud, Globe2, Sparkles, Users } from 'lucide-react';

interface ProviderLogoProps {
  providerId: string;
}

function ProviderLogo({ providerId }: ProviderLogoProps) {
  const commonStyles = 'h-11 w-11 rounded-2xl border border-white/10 p-2 text-white';

  switch (providerId) {
    case 'google-gemini':
      return <Sparkles className={`${commonStyles} bg-gradient-to-br from-[#3FC7FF] to-[#0076FF]`} />;
    case 'groq':
      return <Brain className={`${commonStyles} bg-gradient-to-br from-[#F5A623] to-[#D35400]`} />;
    case 'openrouter':
      return <Globe2 className={`${commonStyles} bg-gradient-to-br from-[#8B5CF6] to-[#4338CA]`} />;
    case 'cerebras':
      return <Cloud className={`${commonStyles} bg-gradient-to-br from-[#22C55E] to-[#16A34A]`} />;
    case 'together-ai':
      return <Users className={`${commonStyles} bg-gradient-to-br from-[#34D399] to-[#0F766E]`} />;
    default:
      return <Sparkles className={`${commonStyles} bg-slate-700`} />;
  }
}

export default memo(ProviderLogo);
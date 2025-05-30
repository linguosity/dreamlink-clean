import { OpenAITest } from '@/components/OpenAITest';

export default function TestOpenAIPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">OpenAI Edge Function Test</h1>
      <OpenAITest />
    </div>
  );
}
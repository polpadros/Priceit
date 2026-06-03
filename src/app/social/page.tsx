import Link from 'next/link'
import { Users, MessageCircle, Heart, Camera, ArrowRight } from 'lucide-react'

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-14 text-center">
          <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none">
            <span className="text-pink-400 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">Social</span>
          </h1>
          <p className="text-zinc-400 text-lg">Connect with friends, share your nights</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 text-pink-400 text-sm font-semibold mb-6">
            🚀 Coming soon
          </div>
          <p className="text-zinc-400 text-lg">The social features are on the way. Here&apos;s what&apos;s coming:</p>
        </div>

        <div className="space-y-4">
          {[
            { icon: Users, title: 'Friends & Following', desc: 'Follow friends and see where they go out', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { icon: Camera, title: 'Night Photos Feed', desc: 'Browse photos from clubs posted by the community', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Heart, title: 'Shared Favourites', desc: 'See your friends\' favourite venues', color: 'text-red-400', bg: 'bg-red-500/10' },
            { icon: MessageCircle, title: 'Direct Messages', desc: 'Private DMs — invite friends to your night out', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className={`${f.bg} rounded-xl p-3 shrink-0`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <div>
                <p className="font-bold text-white mb-1">{f.title}</p>
                <p className="text-zinc-500 text-sm">{f.desc}</p>
              </div>
              <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 rounded-full px-2 py-1 shrink-0 self-start">Soon</span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-zinc-500 text-sm mb-4">Meanwhile, explore venues and plan your night</p>
          <Link href="/night-planner" className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            🗺️ Night Planner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}

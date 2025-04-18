import { FaLinkedin, FaTwitter } from 'react-icons/fa6';
import HomeHeader from '../components/HomeHeader'
import FeatureCard from '../components/FeatureCard';
import IntegrationCard from '../components/IntegrationCard';
import UsageTabGroup from '../components/UsageTabGroup';
import integrations from '../consts/integrations';
import features from '../consts/features';
import { GradientButton, TransparentButton } from '../library/Button'

const slideImages = [
  '/media/annie.png',
  '/media/nexus.svg',
  '/media/pulse-protocol.png',
  '/media/eve.png',
  '/media/wirebee.svg',
  '/media/futurise.png',
  '/media/evergrowth.svg',
]

function Home() {
  return (
    <>
      <HomeHeader />
      <section
        className="relative py-44 text-center"
        style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 20%, #0000, #060f11 32%), linear-gradient(to bottom, #060f113d, #060f113d), url(https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/65fa2a656f67211f0f4ece36_Abstract%20Lines%20BG.webp)' }}
      >
        <div className='absolute w-[500px] h-[500px] bg-indigo-300 rounded-full blur-[200px] mx-auto my-auto top-[-388px] left-0 right-0 z-[1]' />
        <div className="container mx-auto px-6 py-4">
          <div className='max-w-[864px] mx-auto mb-24'>
            <h1 className="text-6xl font-bold text-white leading-[1.2] mb-3">
              Build next-gen voice agents with
              <span className='text-indigo-600'> 500ms </span>
              latency
            </h1>
            <p className="text-neutral-500 mb-6 max-w-[564px] mx-auto">
              Effortlessly create advanced LLM-based voice applications with ultra-low latency — The Fastest on the Market.
            </p>
            <div className='flex justify-center gap-4'>
              <GradientButton>
                Get Started in Minutes
              </GradientButton>
              <TransparentButton className='flex gap-2 items-center'>
                <div>See It in Action</div>
                <img
                  src="https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/65fa2a656f67211f0f4eceb5_Wand.svg"
                  alt="Wand"
                  className='w-5'
                  loading="lazy"
                />
              </TransparentButton>
            </div>
          </div>
          <div className='relative max-w-[1114px] mx-auto'>
            <img src="https://www.elysiapartners.com/wp-content/uploads/2025/04/ai-agent-2.webp" alt="" className='relative w-4/5 max-w-full mx-auto z-[2]' />
            <div className='absolute w-[400px] h-[400px] bg-indigo-400 rounded-full blur-[156px] mx-auto my-auto top-0 left-0 right-0 bottom-0 z-[1]'></div>
          </div>
        </div>
      </section>
      <section className='py-6 relative'>
        <div className='relative max-w-[1312px] px-6 mx-auto'>
          <div className="text-center mb-12 text-xl font-bold">
            Trusted by Developers & Businesses Worldwide
          </div>
          <div className="relative overflow-clip w-full group flex">
            <div className="animate-marquee-move flex w-max">
              {slideImages.map((image, index) => (
                <img
                  src={image}
                  alt=""
                  className='opacity-25 w-[156px] mx-8'
                  key={`slide-1-${index}`}
                  loading="lazy"
                />
              ))}
              {slideImages.map((image, index) => (
                <img
                  src={image}
                  alt=""
                  className='opacity-25 w-[156px] mx-8'
                  key={`slide-2-${index}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="Features" className='py-24 relative'>
        <div className="container mx-auto mb-14 px-6 py-4 relative">
          <div className='max-w-[900px] mb-14 mx-auto flex justify-center items-center flex-col gap-3 text-center'>
            <h2 className='text-5xl font-bold text-white mb-3'>
              Frustrated by latency and complexity in Voice AI?
            </h2>
            <p className='text-xl mb-3'>
              We give you everything you need to create instant, human-like, and affordable voice agents.
            </p>
          </div>
          <div className='z-[2] grid grid-cols-3 grid-rows-2 gap-6'>
            <div className='col-span-1 row-span-2'>
              <div className="flex flex-col gap-2 backdrop-blur-xs border border-white/30 rounded-2xl overflow-hidden">
                <div className='px-14 py-12'>
                  <div className='mb-4'>
                    <div className="rounded-lg w-12 h-12 bg-white/5 text-sky-800 border border-white/30 flex items-center justify-center">
                      <img 
                        src="https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/65fb66df77b82401eb5d551e_speed_white_24dp.svg" 
                        alt="" 
                        className='hue-rotate-[135deg]'
                      />
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold leading-[1.2]">
                    Optimized to be the Lowest Latency
                  </h3>
                  <p className='text-neutral-400 mb-3'>
                    Experience seamless, natural conversations with groundbreaking 600ms latency, nearing the gold standard of conversational speech.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060f11] to-transparent z-[2]" />
                  <img
                    src="https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/6603487522f60ac2cc4c3e61_Frame%20113.png"
                    alt=""
                    className='object-cover w-full h-full hue-rotate-[135deg]'
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            {features.map((feature, index) => (
              <div key={`card-${index}`} className='col-span-1 row-span-1'>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
          <div className="absolute w-[200px] h-[200px] bg-sky-600 rounded-full blur-[156px] mx-auto my-auto top-0 left-0 right-0 bottom-0 z-[1]" />
        </div>
      </section>
      <section className="py-24 relative">
        <div className="container mx-auto px-6 py-4">
          <div className='max-w-[900px] mb-14 mx-auto flex justify-center items-center flex-col gap-3 text-center'>
            <h2 className='text-5xl font-bold text-white mb-3'>
              Unlock the Power of Voice AI Across Industries
            </h2>
            <p className='text-xl mb-3'>
              From customer support to virtual assistants, see how Millis AI transforms voice interactions in every industry.
            </p>
          </div>
          <UsageTabGroup />
          <div className='flex flex-col gap-2 align-center justify-center max-w-[900px] mx-auto mb-14 text-center'>
            <h2 className='text-2xl font-bold text-white my-3'>
              Are you an innovator ready to revolutionize with voice AI?
            </h2>
            <div className="mb-3">
              <GradientButton className='flex gap-2 items-center mx-auto'>
                <img
                  src="https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/65fa2a656f67211f0f4eceac_Rocket.svg"
                  alt="Rocket"
                  className='w-5'
                  loading="lazy"
                />
                <div>Let's Chat</div>
              </GradientButton>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 relative">
        <div className="container mx-auto px-6 py-4">
          <div className='mb-14 w-3/5'>
            <div className='text-sky-700 text-xl tracking-wider font-bold mb-3'>Integrations</div>
            <h2 className='text-4xl font-bold text-white mb-3'>
              Build, Integrate, and Deploy Advanced Voice Agents in minutes
            </h2>
            <p className='text-neutral-500 mb-3'>
              From creation to deployment, Millis AI provides a complete solution that fits seamlessly into your existing systems.
            </p>
          </div>
          <div className='grid grid-cols-4 gap-4'>
            {integrations.map((integration, index) => (
              <IntegrationCard key={`integration-${index}`} {...integration} />
            ))}
          </div>
        </div>
      </section>
      <section className="py-14 relative">
        <div className="container mx-auto px-6 py-4 relative">
          <div
            className='max-w-full rounded-2xl p-14 border border-white/30 bg-cover bg-center'
            style={{ backgroundImage: 'linear-gradient(to right, #060ff11f, #a9fcf11f), url("/media/65fa2a656f67211f0f4ece36_Abstract20BG.webp")' }}
          >
            <div className="flex flex-col text-center">
              <h2 className="mb-3 text-xl font-semibold">
                Get Started with us.
              </h2>
              <p className="mb-3">
                Join Us on the Cutting Edge of Conversational AI — Let's Build Something Amazing Together.
              </p>
              <GradientButton className='flex gap-2 items-center mx-auto'>
                <img
                  src="https://cdn.prod.website-files.com/65fa2a656f67211f0f4ecd57/65fa2a656f67211f0f4eceac_Rocket.svg"
                  alt="Rocket"
                  className='w-5'
                  loading="lazy"
                />
                Create Your Agent
              </GradientButton>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-10 relative overflow-hidden">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-6 flex-col">
            <a href="/">
              <img src="https://www.elysiapartners.com/wp-content/uploads/2025/03/fav.png" alt="Logo" className='w-[100px]' />
            </a>
            <div className="flex gap-3 items-center">
              <a
                href="https://twitter.com/millis_ai"
                className="rounded-lg p-2 text-black bg-neutral-50 border border-white/30 hover:bg-black hover:text-white hover:border-white transition-all duration-300"
              >
                <FaTwitter />
              </a>
              <a
                href="https://www.linkedin.com/company/millis-ai"
                className="rounded-lg p-2 text-black bg-neutral-50 border border-white/30 hover:bg-black hover:text-white hover:border-white transition-all duration-300"
              >
                <FaLinkedin />
              </a>
            </div>
            <a href="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600">
              <img src="/media/featured-on-taaft.png" alt="" className='w-[300px]' />
            </a>
          </div>
          <div className="border-t border-white/30 mt-14 pt-5 flex justify-between">
            <div className='text-sm'>© 2025 All rights reserved.</div>
            <div className="flex gap-6">
              <a
                href="/privacy"
                className="text-sky-600 hover:text-white transition-all duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sky-600 hover:text-white transition-all duration-300"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
        <div className="absolute w-[500px] h-[500px] bg-sky-800 rounded-[50%] blur-[200px] mx-auto my-auto top-[90%] left-0 right-0 z-[1]" />
      </section>
    </>
  )
}

export default Home

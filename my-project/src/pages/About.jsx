import {
  Building2,
  Search,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  Star,
  HeartHandshake,
  Home,
  Users2,
  Building,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const WaveBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <svg className="absolute w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path
        fill="#3b82f6"
        fillOpacity="0.1"
        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
      <path
        fill="#60a5fa"
        fillOpacity="0.08"
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
      <path
        fill="#93c5fd"
        fillOpacity="0.05"
        d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </div>
);

const StatsSection = () => {
  const stats = [
    { icon: <Home className="w-8 h-8" />, value: "10K+", label: "Active Listings" },
    { icon: <Users2 className="w-8 h-8" />, value: "8K+", label: "Happy Users" },
    { icon: <Building className="w-8 h-8" />, value: "5K+", label: "Properties Sold" },
    { icon: <Award className="w-8 h-8" />, value: "15+", label: "Years Experience" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-blue-600 mb-3 flex justify-center">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ text, name, role, image }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-4">
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
      />
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
    <p className="text-gray-700 italic">"{text}"</p>
  </motion.div>
);

const TeamMemberCard = ({ name, role, image, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 group"
  >
    <div className="relative w-32 h-32 mx-auto mb-4">
      <img
        src={image}
        alt={name}
        className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-all duration-300"
      />
      <div className="absolute inset-0 rounded-full bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </div>
    <h4 className="text-lg font-semibold text-blue-700 mb-1">{name}</h4>
    <p className="text-sm text-gray-600">{role}</p>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center group"
    >
      <div className="transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
};

const Section = ({ title, description, children, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 text-center"
    >
      <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
        {icon && <span className="text-blue-500">{icon}</span>}
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </motion.div>
  );
};

const ValueCard = ({ icon, title, text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-md p-6 text-left flex items-start gap-3 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-blue-700 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </motion.div>
  );
};

export default function About() {
  const testimonials = [
    {
      text: "RealityHub made finding my dream home so easy! The platform is intuitive and the listings are always up-to-date.",
      name: "Sarah M.",
      role: "Homeowner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      text: "I've been using RealityHub for years, and it's consistently the best real estate platform I've found.",
      name: "John B.",
      role: "Real Estate Investor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      text: "The customer service is exceptional, and the property recommendations are spot-on!",
      name: "Emily R.",
      role: "First-time Buyer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  const teamMembers = [
    {
      name: "Jon Doe",
      role: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop"
    },
    {
      name: "Jane Smith",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
    },
    {
      name: "Ahmed Ali",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop"
    }
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <WaveBackground />
      <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-10 text-center text-blue-700"
        >
          About RealityHub
        </motion.h1>

        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16 flex justify-center relative rounded-xl overflow-hidden shadow-lg"
        >
          <img
            src="/house.avif"
            alt="Real Estate Overview"
            className="w-screen max-h-[300px] object-cover"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-[1.5rem] left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-6 rounded-full shadow-xl hover:opacity-90 transition"
          >
            <Search className="w-4 h-4 mr-2 inline-block" />
            Start Your Search Now
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-3xl mx-auto text-gray-600 mb-12 text-base leading-relaxed"
        >
          RealityHub is your one-stop destination for discovering the perfect property. Whether you're looking to rent, buy, or just browse, we bring you a wide range of listings, user-friendly search tools, and detailed property insights to help you make the right decision.
        </motion.p>

        {/* Features Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <FeatureCard
            icon={<Building2 size={32} className="text-blue-500 mb-2" />}
            title="Wide Range of Listings"
            description="From cozy apartments to luxurious villas, we cover every category to suit your needs."
          />
          <FeatureCard
            icon={<Search size={32} className="text-blue-500 mb-2" />}
            title="Powerful Search Tools"
            description="Filter properties by type, price, location, and more with our intuitive search system."
          />
          <FeatureCard
            icon={<ShieldCheck size={32} className="text-blue-500 mb-2" />}
            title="Trusted by Users"
            description="Thousands of users trust RealityHub to find their next home every day."
          />
        </div>

        {/* Stats Section */}
        <StatsSection />

        {/* Team Section */}
        <Section
          title="Meet Our Team"
          description="Behind RealityHub is a dedicated team of professionals passionate about real estate and technology. We strive to create the best possible experience for our users."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={index}
                {...member}
                delay={index * 0.2}
              />
            ))}
          </div>
        </Section>

        {/* Testimonials Section */}
        <Section title="What Our Users Say">
          <div className="max-w-4xl mx-auto">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
              }}
              className="pb-12"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <TestimonialCard {...testimonial} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Section>

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who found their perfect property through RealityHub.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Search Now
          </motion.button>
        </motion.section>

        {/* Contact Section */}
        <Section
          title="Contact Us"
          icon={<Mail size={24} className="inline-block text-blue-500" />}
        >
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 mb-4">
              Email: <span className="text-blue-700">support@realhub.com</span>
            </p>
            <p className="text-gray-600">
              Phone: <span className="text-blue-700">+20 123 456 7890</span>
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
} 
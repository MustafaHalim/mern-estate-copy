// About.tsx
import {
  Building2,
  Search,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  Star,
  HeartHandshake,
} from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 relative">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-10 text-center text-blue-700"
      >
        About RealityHub
      </motion.h1>

      {/* صورة بانر + زر */}
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

      {/* مميزات الموقع */}
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

      {/* الفريق */}
      <Section
        title="Meet Our Team"
        description="Behind RealityHub is a dedicated team of professionals passionate about real estate and technology. We strive to create the best possible experience for our users."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["John Doe", "Jane Smith", "Ahmed Ali"].map((name, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              <img
                src="/house.avif"
                alt={`Team Member ${i + 1}`}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow"
              />
              <h4 className="text-lg font-semibold text-blue-700">{name}</h4>
              <p className="text-sm text-gray-600">
                {["Co-Founder & CEO", "Head of Product", "Lead Developer"][i]}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* القصة */}
      <Section title="Our Story">
        <p className="text-gray-600 text-base leading-relaxed max-w-3xl mx-auto">
          RealityHub was born from a simple idea: to make finding the perfect property easier and more transparent for everyone. With a tech-driven approach and deep understanding of user needs, we transformed that idea into a powerful platform.
        </p>
      </Section>

      {/* القيم */}
      <Section title="Our Core Values">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <ValueCard
            icon={<Star size={24} className="text-yellow-500" />}
            title="Transparency"
            text="We believe in clear and honest communication in all our interactions."
          />
          <ValueCard
            icon={<ShieldCheck size={24} className="text-green-500" />}
            title="Trustworthiness"
            text="Building and maintaining the trust of our users is paramount to us."
          />
          <ValueCard
            icon={<Users size={24} className="text-purple-500" />}
            title="User-Centricity"
            text="Everything we do is designed with our users' needs and satisfaction in mind."
          />
        </div>
      </Section>

      {/* شهادات المستخدمين */}
      <Section title="What Our Users Say">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Testimonial
            text="RealityHub made finding my new apartment so easy!"
            name="Sarah M."
          />
          <Testimonial
            text="I highly recommend RealityHub for anyone looking to buy or rent."
            name="John B."
          />
        </div>
      </Section>

      {/* تواصل معنا */}
      <Section
        title="Contact Us"
        icon={<Mail size={24} className="inline-block text-blue-500" />}
      >
        <p className="text-gray-600">
          Email: <span className="text-blue-700">support@realityhub.com</span>
        </p>
        <p className="text-gray-600">
          Phone: <span className="text-blue-700">+20 123 456 7890</span>
        </p>
      </Section>

      {/* لماذا نحن */}
      <Section
        title="Why Choose RealityHub?"
        icon={<HeartHandshake size={24} className="inline-block text-red-500" />}
      >
        <p className="text-gray-600 max-w-xl mx-auto">
          We're committed to making real estate easier for everyone. With transparent listings, expert insights, and responsive support, you’ll always feel confident about your next move.
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-6 mt-6 rounded-full shadow-md transition duration-300">
          Start Your Search Now
        </button>
      </Section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-center"
    >
      {icon}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}

function Section({ title, description, children, icon }) {
  return (
    <div className="mt-20 text-center">
      <h3 className="text-2xl font-bold mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-left flex items-start gap-3 hover:shadow-lg transition">
      {icon}
      <div>
        <h4 className="font-semibold text-blue-700">{title}</h4>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function Testimonial({ text, name }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-left shadow-sm hover:shadow-md transition">
      <p className="text-gray-700 italic mb-2">"{text}"</p>
      <p className="text-sm font-semibold text-right">- {name}</p>
    </div>
  );
}

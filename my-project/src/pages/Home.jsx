import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
import { motion } from 'framer-motion';
import { HomeIcon, Search, BadgePercent, Building2 } from 'lucide-react';

SwiperCore.use([Navigation]);

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex flex-col gap-6 px-4 py-24 max-w-6xl mx-auto text-center bg-gradient-to-r from-blue-950 to-slate-900 rounded-lg shadow-lg">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg"
        >
          Find your next <span className="text-blue-300">perfect</span><br />place with ease
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-200 text-sm sm:text-base max-w-xl mx-auto"
        >
          RealityHub is the best place to discover your dream property. From cozy rentals to luxurious homes for sale, we’ve got it all.
        </motion.p>
        <Link
          to='/search'
          className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition"
        >
          Let’s get started
        </Link>
      </section>

      {/* Feature Icons */}
      <section className="max-w-6xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <HomeIcon className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">Wide Range of Listings</h3>
          <p className="text-slate-500 mt-2">Discover properties across all price ranges and locations.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <Search className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">Advanced Search</h3>
          <p className="text-slate-500 mt-2">Filter and sort listings based on your exact preferences.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
          <BadgePercent className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">Exclusive Offers</h3>
          <p className="text-slate-500 mt-2">Get access to the best property deals and discounts.</p>
        </div>
      </section>

      {/* Swiper Section */}
      <section className="relative w-full">
        <Swiper navigation loop={offerListings.length > 1} className="w-full h-[500px]">
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='h-full w-full flex items-center justify-center text-white text-2xl font-bold shadow-inner'
              >
                {listing.name}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Listing Sections */}
      <section className='max-w-6xl mx-auto p-6 flex flex-col gap-12 my-12'>
        {offerListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className='mb-4'>
              <h2 className='text-3xl font-bold text-slate-700'>Recent Offers</h2>
              <Link className='text-blue-600 hover:underline text-sm' to={'/search?offer=true'}>
                Show more offers
              </Link>
            </div>
            <div className='flex flex-wrap gap-6'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </motion.div>
        )}

        {rentListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className='mb-4'>
              <h2 className='text-3xl font-bold text-slate-700'>Places for Rent</h2>
              <Link className='text-blue-600 hover:underline text-sm' to={'/search?type=rent'}>
                Show more places for rent
              </Link>
            </div>
            <div className='flex flex-wrap gap-6'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </motion.div>
        )}

        {saleListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className='mb-4'>
              <h2 className='text-3xl font-bold text-slate-700'>Places for Sale</h2>
              <Link className='text-blue-600 hover:underline text-sm' to={'/search?type=sale'}>
                Show more places for sale
              </Link>
            </div>
            <div className='flex flex-wrap gap-6'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;

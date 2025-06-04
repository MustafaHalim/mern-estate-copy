import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { FaBed, FaBath, FaRuler, FaTag } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <div className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full'>
      <Link to={`/listing/${listing._id}`} className="flex flex-col h-full">
        <div className="relative">
          <img
            src={
              listing.imageUrls[0] ||
              'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
            }
            alt={listing.name}
            className='h-56 w-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out'
          />
          {/* Property type badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-md ${listing.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
          
          {/* Offer badge */}
          {listing.offer && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
                <FaTag className="w-3 h-3" />
                Special Offer
              </span>
            </div>
          )}
        </div>
        
        <div className='p-5 flex flex-col gap-2 flex-grow'>
          <div className="space-y-1">
            <h3 className='text-lg font-bold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors'>
              {listing.name}
            </h3>
            <div className='flex items-center gap-1 text-gray-600'>
              <MdLocationOn className='h-4 w-4 text-green-700' />
              <p className='text-sm truncate w-full'>
                {listing.address}
              </p>
            </div>
          </div>
          
          <p className='text-sm text-gray-600 line-clamp-2 mt-2 flex-grow'>
            {listing.description}
          </p>
          
          <div className='flex flex-wrap gap-3 mt-4 border-t pt-4 text-gray-700'>
            {listing.bedrooms && (
              <div className='flex items-center gap-1 text-sm'>
                <FaBed className="text-blue-500" />
                <span>{listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
              </div>
            )}
            
            {listing.bathrooms && (
              <div className='flex items-center gap-1 text-sm'>
                <FaBath className="text-blue-500" />
                <span>{listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
              </div>
            )}
            
            {listing.size && (
              <div className='flex items-center gap-1 text-sm'>
                <FaRuler className="text-blue-500" />
                <span>{listing.size} m²</span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className='text-blue-600 font-bold text-lg flex items-center'>
              ${listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' '}
              <span className="text-sm font-normal text-gray-500">
                {listing.type === 'rent' && '/ month'}
              </span>
              {listing.offer && (
                <span className="ml-2 line-through text-sm text-gray-400 font-normal">
                  ${listing.regularPrice.toLocaleString('en-US')}
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { FaSearch, FaFilter, FaHome, FaKey, FaTag } from 'react-icons/fa';

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <div className='flex flex-col md:flex-row bg-gray-50 min-h-screen'>
      {/* Sidebar */}
      <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen bg-white shadow-sm'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          {/* Search Bar */}
          <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg'>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search by property name or address...'
              className='border-0 bg-transparent p-2 w-full focus:outline-none'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
            <button type="submit" className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
              <FaSearch className="w-4 h-4" />
            </button>
          </div>

          {/* Property Type */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
              <FaHome className="w-4 h-4" />
              Property Type
            </h3>
            <div className='flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => setSidebardata({ ...sidebardata, type: 'all' })}
                className={`px-4 py-2 rounded-lg transition ${
                  sidebardata.type === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                type='button'
                onClick={() => setSidebardata({ ...sidebardata, type: 'rent' })}
                className={`px-4 py-2 rounded-lg transition ${
                  sidebardata.type === 'rent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaKey className="inline-block mr-2" />
                Rent
              </button>
              <button
                type='button'
                onClick={() => setSidebardata({ ...sidebardata, type: 'sale' })}
                className={`px-4 py-2 rounded-lg transition ${
                  sidebardata.type === 'sale'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaHome className="inline-block mr-2" />
                Sale
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
              <FaFilter className="w-4 h-4" />
              Amenities
            </h3>
            <div className='space-y-2'>
              <label className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'>
                <input
                  type='checkbox'
                  id='parking'
                  className='w-4 h-4 text-blue-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.parking}
                />
                <span className='text-gray-700'>Parking</span>
              </label>
              <label className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'>
                <input
                  type='checkbox'
                  id='furnished'
                  className='w-4 h-4 text-blue-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.furnished}
                />
                <span className='text-gray-700'>Furnished</span>
              </label>
              <label className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'>
                <input
                  type='checkbox'
                  id='offer'
                  className='w-4 h-4 text-blue-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.offer}
                />
                <span className='text-gray-700 flex items-center gap-1'>
                  <FaTag className="w-3 h-3" />
                  Special Offer
                </span>
              </label>
            </div>
          </div>

          {/* Sort */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-700'>Sort By</h3>
            <select
              onChange={handleChange}
              defaultValue={'created_at_desc'}
              id='sort_order'
              className='w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='regularPrice_desc'>Price: High to Low</option>
              <option value='regularPrice_asc'>Price: Low to High</option>
              <option value='created_at_desc'>Latest First</option>
              <option value='created_at_asc'>Oldest First</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className='flex-1 p-6'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
          Search Results
          {listings.length > 0 && (
            <span className='text-gray-500 text-lg ml-2'>
              ({listings.length} properties)
            </span>
          )}
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {!loading && listings.length === 0 && (
            <p className='text-gray-600 col-span-full text-center py-8'>
              No properties found matching your criteria
            </p>
          )}
          {loading && (
            <p className='text-gray-600 col-span-full text-center py-8'>
              Loading properties...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
        </div>

        {showMore && (
          <button
            onClick={onShowMoreClick}
            className='mt-8 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
          >
            Load More Properties
          </button>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingSet, setFollowingSet] = useState(new Set());

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get('https://pranav-social-media.onrender.com/api/v1/user/suggested', {
          withCredentials: true,
        });
        if (res.data.success) {
          setSuggestedUsers(res.data.users);
          const initialFollowSet = new Set(
            res.data.users
              .filter(u => u.followers.includes(user._id))
              .map(u => u._id)
          );
          setFollowingSet(initialFollowSet);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSuggestedUsers();
  }, [user?._id]);

  const handleFollowOrUnfollow = async (targetUserId) => {
    try {
      const res = await axios.post(
        `https://pranav-social-media.onrender.com/api/v1/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setFollowingSet(prev => {
          const updated = new Set(prev);
          if (updated.has(targetUserId)) {
            updated.delete(targetUserId);
          } else {
            updated.add(targetUserId);
          }
          return updated;
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className='w-fit my-10 pr-32'>
      <div className='flex items-center gap-2 mb-6'>
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className='font-semibold text-sm'>
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
        </div>
      </div>

      {/* Suggested Users Section */}
      <h2 className='font-semibold text-sm mb-2 text-gray-600'>Suggested for you</h2>
      <div className='flex flex-col gap-4'>
        {suggestedUsers.map(sUser => (
          <div key={sUser._id} className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <Link to={`/profile/${sUser._id}`}>
                <Avatar className='w-8 h-8'>
                  <AvatarImage src={sUser.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col'>
                <Link to={`/profile/${sUser._id}`} className='text-sm font-medium'>
                  {sUser.username}
                </Link>
                <span className='text-xs text-gray-500'>{sUser.bio || 'Bio...'}</span>
              </div>
            </div>
            <Button
              onClick={() => handleFollowOrUnfollow(sUser._id)}
              className={`h-7 px-4 text-xs ${
                followingSet.has(sUser._id)
                  ? 'bg-gray-200 text-black hover:bg-gray-300'
                  : 'bg-[#0095F6] text-white hover:bg-[#1877f2]'
              }`}
            >
              {followingSet.has(sUser._id) ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;

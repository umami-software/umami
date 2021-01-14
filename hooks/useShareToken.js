import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import { setShareToken } from 'redux/actions/app';

export default function useShareToken(shareId) {
  const { basePath } = useRouter();
  const dispatch = useDispatch();
  const shareToken = useSelector(state => state.app.shareToken);

  async function loadToken(id) {
    const { data } = await get(`${basePath}/api/share/${id}`);

    if (data) {
      dispatch(setShareToken(data));
    }
  }

  useEffect(() => {
    if (shareId) {
      loadToken(shareId);
    }
  }, [shareId]);

  return shareToken;
}

import { useRouter } from 'next/router';
import * as reactQuery from '@tanstack/react-query';
import { useApi as nextUseApi } from 'next-basics';
import { getClientAuthToken } from 'lib/client';
import { SHARE_TOKEN_HEADER } from 'lib/constants';
import useStore from 'store/app';

const selector = state => state.shareToken;

export function useApi() {
  const { basePath } = useRouter();
  const shareToken = useStore(selector);

  const { get, post, put, del } = nextUseApi(
    { authorization: `Bearer ${getClientAuthToken()}`, [SHARE_TOKEN_HEADER]: shareToken?.token },
    basePath,
  );

  return { get, post, put, del, ...reactQuery };
}

export default useApi;

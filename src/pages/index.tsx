import { Button, Box } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useInfiniteQuery, UseInfiniteQueryResult } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImagesQueryResponse {
  after?: {
    id: string;
  };
  data: {
    data: {
      title: string;
      description: string;
      url: string;
    };
    ts: number;
    ref: {
      id: string;
    };
  }[];
}

interface HomeProps {
  pageParam: number;
}

interface ImageData {
  list: Image[];
  after: string;
}

interface Image {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

export default function Home({ pageParam = null }: HomeProps): JSX.Element {

  let lastResponse: ImagesQueryResponse;

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,  // depois apaga e usa isError e isLoading - Clarinha
  } = useInfiniteQuery(
    'images',
    // TODO AXIOS REQUEST WITH PARAM
    ({ pageParam = 0 }) =>
      api.get('/api/images?after=' + pageParam)
        .then(
          (response) => {
            console.log("retorno do axios: ", response.data);
            lastResponse = response.data as ImagesQueryResponse;
          })
    ,
    // TODO GET AND RETURN NEXT PAGE PARAM
    {
      getNextPageParam: () => {
        if (!lastResponse)
          return null;
        console.log("lastResponse= ", lastResponse);
        const { after } = lastResponse;
        console.log("after= ", after);
        return after ?? null;
      },
    }
  );

  const formattedData = useMemo(() => {
    // TODO FORMAT AND FLAT DATA ARRAY
    console.log("dentro do useMemo: ", data);
    return 0;
  }, [data]);

  // TODO RENDER LOADING SCREEN

  // TODO RENDER ERROR SCREEN

  return status === 'loading' ? (
    <Loading />
  ) : status === 'error' ? (
    <Error />
  ) :
    (
      <>
        <Header />

        <Box maxW={1120} px={20} mx="auto" my={20}>
          <CardList cards={formattedData} />
          {/* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */}
        </Box>
      </>
    );
}

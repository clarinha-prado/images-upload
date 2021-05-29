import { Button, Box } from '@chakra-ui/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import Head from 'next/head';

import { CardList } from '../components/CardList';
import { Error } from '../components/Error';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../services/api';

interface ImageData {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

type InfiniteQueryResponse = {
  after: number | null;
  data: ImageData[];
};

export default function Home(): JSX.Element {
  // declaracao da funcao, definindo o tipo de retorno
  const queryFn = async ({ pageParam = null }): Promise<InfiniteQueryResponse> => {
    const { data } = await api.get('/api/images', {
      // params contem a query string do GET
      params: {
        after: pageParam,
      },
    });
    // nao esquecer de RETORNAR OS DADOS!!!!
    return data;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<unknown, unknown, InfiniteQueryResponse>(
    'images',
    queryFn,
    {
      getNextPageParam: (data: InfiniteQueryResponse) => data.after,
    }
  );

  const formattedData = useMemo(() => {
    const flatData = data?.pages.map(page => page.data).flat();
    if (data) {
      console.log("data.pages: ", data.pages);
      console.log("")
    }
    console.log("formattedData: ", flatData);
    return flatData;
  }, [data]);

  if (isLoading) return <Loading />;

  if (isError) return <Error />;

  return (
    <>
      <Head>
        <title>UpFi</title>
        <link rel="shortcut icon" href="logo.svg" />
      </Head>

      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (

          <Button mt={8} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Carregando' : 'Carregar mais'}
          </Button>
        )}

      </Box>
    </>
  );
}
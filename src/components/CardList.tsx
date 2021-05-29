import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { url } from 'inspector';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {

  const [urlClicked, setUrlClicked] = useState("");

  // TODO MODAL USEDISCLOSURE
  const { isOpen, onOpen, onClose } = useDisclosure();

  // TODO SELECTED IMAGE URL STATE

  // TODO FUNCTION HANDLE VIEW IMAGE
  function viewImage(url: string) {
    setUrlClicked(url);
    console.log("url clicada: ", url);
    console.log("antes do onOpen, isOpen = ", isOpen);
    onOpen();
    console.log("depois do onOpen, isOpen = ", isOpen);
  }

  return (
    <>
      {/* TODO CARD GRID */}
      <SimpleGrid columns={3} spacing="40px">
        {cards.map((item, index) =>
          <Card key={index} data={item} viewImage={viewImage} />
        )}
      </SimpleGrid>

      {/* TODO MODALVIEWIMAGE */}
      <ModalViewImage isOpen={isOpen} onClose={onClose} imgUrl={urlClicked} />
    </>
  );
}

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Image,
  Link,
} from '@chakra-ui/react';

interface ModalViewImageProps {
  isOpen: boolean;
  onClose: () => void;
  imgUrl: string;
}

export function ModalViewImage({
  isOpen,
  onClose,
  imgUrl,
}: ModalViewImageProps): JSX.Element {
  // TODO MODAL WITH IMAGE AND EXTERNAL LINK
  return (

    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        alignSelf="center"
        w="auto"
        maxW="990px"
        maxH="600px"
      >
        <ModalBody
          p="0"
        >

          <Image
            maxW="990px"
            maxH="600px"
            objectFit="contain"
            src={imgUrl}
            alt={imgUrl}
          />

        </ModalBody>

        <ModalFooter justifyContent="start" bgColor="pGray.800">

          <Link
            fontWeight="400"
            fontSize="14px"
            lineHeight="16.41px"
            color="pGray.50"
            href={imgUrl}
            isExternal
          >
            Abrir original
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>


  );
}

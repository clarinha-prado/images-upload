import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface FormData {
  title: string,
  description: string,
  image: string
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      // TODO REQUIRED, LESS THAN 10 MB AND ACCEPTED FORMATS VALIDATIONS
      required: {
        value: true,
        message: "Arquivo obrigatório"
      },
      // para validacoes customizacas usar a propriedade 'validate' 
      // cada validacao deve ser uma funcao q recebe o valor digitado no campo
      // como parametro de entrada
      validate: {

        lessThan10MB: (files: FileList) => {
          return files[0].size < 10 * 1024 * 1024
            || "O arquivo deve ser menor que 10MB";
        },

        acceptedFormats: (files: FileList) => {
          const str = /([a-zA-Z0-9\s_\\.\-\(\):])+(.gif|.png|.jpg|.jpeg)$/;
          const regex = new RegExp(str);

          console.log("nome do arquivo: ", files[0].name);
          return regex.test(files[0].name)
            || "Somente são aceitos arquivos PNG, JPEG e GIF";
        }

      }
    },

    title: {
      // TODO REQUIRED, MIN AND MAX LENGTH VALIDATIONS
      required: {
        value: true,
        message: "Título obrigatório"
      },
      minLength: {
        value: 2,
        message: "Mínimo de 2 caracteres"
      },
      maxLength: {
        value: 20,
        message: "Máximo de 20 caracteres"
      },
    },

    description: {
      // TODO REQUIRED, MAX LENGTH VALIDATIONS
      required: {
        value: true,
        message: "Descrição obrigatória"
      },
      maxLength: {
        value: 65,
        message: "Máximo de 65 caracteres"
      }
    },
  };

  const queryClient = useQueryClient();

  const saveData = async (formData: FormData) => {
    await api.post("/api/images", formData);
  }

  const mutation = useMutation(
    // TODO MUTATION API POST REQUEST,
    saveData,
    {
      // TODO ONSUCCESS MUTATION
      onSuccess: () => {
        queryClient.invalidateQueries()
      }
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      // TODO SHOW ERROR TOAST IF IMAGE URL DOES NOT EXISTS
      async () => await fetch(data.image) || toast({
        title: "Imagem não adicionada",
        description: "É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;


      // TODO EXECUTE ASYNC MUTATION
      // TODO SHOW SUCCESS TOAST
    } catch {
      // TODO SHOW ERROR TOAST IF SUBMIT FAILED
    } finally {
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}

          // TODO SEND IMAGE ERRORS
          error={errors.image}

          // TODO REGISTER IMAGE INPUT WITH VALIDATIONS
          {...register("image", formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          // TODO SEND TITLE ERRORS
          error={errors.title}

          // TODO REGISTER TITLE INPUT WITH VALIDATIONS
          {...register("title", formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          // TODO SEND DESCRIPTION ERRORS
          error={errors.description}

          // TODO REGISTER DESCRIPTION INPUT WITH VALIDATIONS
          {...register("description", formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}

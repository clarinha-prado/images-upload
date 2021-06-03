import { Box, Button, useToast } from '@chakra-ui/react';
import { FileInputClarinha } from '../components/Input/FileInputClarinha';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function Teste(): JSX.Element {
    const [imageUrl, setImageUrl] = useState('');
    const [localImageUrl, setLocalImageUrl] = useState('');
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState,
        setError,
        // Manually triggers form or input validation
        trigger,
    } = useForm();
    const { errors } = formState;

    const formValidations = {
        image: {
            required: {
                value: true,
                message: "Arquivo obrigatório"
            }
        },
    };

    const onSubmit = async (data: FormData): Promise<void> => {
        toast({
            title: "Imagem cadastrada",
            description: "Sua imagem foi cadastrada com sucesso.",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    }

    return (
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
            <h1>Hello World!</h1>
            <FileInputClarinha
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

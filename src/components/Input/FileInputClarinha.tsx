import {
  Box,
  FormLabel,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  Image,
  Text,
  FormControl,
  FormErrorMessage,
  Flex,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import {
  useState,
  SetStateAction,
  Dispatch,
  ForwardRefRenderFunction,
  forwardRef,
  useCallback,
  useEffect,
} from 'react';
import {
  FieldError,
  FieldValues,
  UseFormSetError,
  UseFormTrigger,
} from 'react-hook-form';
import { FiAlertCircle, FiPlus } from 'react-icons/fi';
import { api } from '../../services/api';

export interface FileInputProps {
  // nome do campo definido no react-hook-form, 1o param do método register = "image"
  name: string;
  // desestruturado do FormState do useForm()
  error?: FieldError;
  // parent component set state function
  setImageUrl: Dispatch<SetStateAction<string>>;
  // parent component state property
  localImageUrl: string;
  // parent component set state function
  setLocalImageUrl: Dispatch<SetStateAction<string>>;
  // unstructured function from useForm()
  setError: UseFormSetError<FieldValues>;
  // this is not being passed....??? talvez porque o register faz a validação do campo no evento
  // onChange
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<boolean | void>;
  // Manually triggers form or input validation
  trigger: UseFormTrigger<FieldValues>;
}

// declaracao do hook setState() - Dispatch é só um sinônimo (alias) q significa: "uma função
// q retorna void"
// function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];


// 
const FileInputBase: ForwardRefRenderFunction<
  HTMLInputElement,
  FileInputProps
> = (
  {
    name,
    error = null,
    setImageUrl,
    localImageUrl,
    setLocalImageUrl,
    setError,
    onChange,
    trigger,
    ...rest
  },
  ref
) => {
    const toast = useToast();
    const [progress, setProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [cancelToken, setCancelToken] = useState<CancelTokenSource>(
      {} as CancelTokenSource
    );

    const handleImageUpload = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!event.target.files?.length) {
          return;
        }

        setImageUrl('');
        setLocalImageUrl('');
        setError('image', null);
        setIsSending(true);

        await onChange(event);
        trigger('image');

        /* Provides a way to easily construct a set of key/value pairs representing form fields
         and their values, which can then be easily sent using the XMLHttpRequest.send() method. 
         It uses the same format a form would use if the encoding type were set to 
         "multipart/form-data". */
        const formData = new FormData();

        formData.append(event.target.name, event.target.files[0]);
        formData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY);

        // pega token de cancelamento para q possa cancelar o post da imagem 
        const { CancelToken } = axios;
        const source = CancelToken.source();
        // guarda o cancel token no estado do componente
        setCancelToken(source);

        // estrutura de dados de configuração do axios
        const config = {
          headers: { 'content-type': 'multipart/form-data' },
          // método provido pelo axios para recuperar o progresso da execução do post (ou get) e para
          // executar algo na aplicação, toda vez q os valores do progresso forem alterados
          //
          // ProgressEvent: Events measuring progress of an underlying process, like an HTTP request 
          // (for an XMLHttpRequest, or the loading of the underlying resource of an , , , or ).
          onUploadProgress: (e: ProgressEvent) => {
            // atualiza estado do componente
            setProgress(Math.round((e.loaded * 100) / e.total));
          },
          cancelToken: source.token,
        } as AxiosRequestConfig;

        try {
          const response = await api.post(
            'https://api.imgbb.com/1/upload',
            formData,
            config
          );

          setImageUrl(response.data.data.url);
          setLocalImageUrl(URL.createObjectURL(event.target.files[0]));
        } catch (err) {
          if (err?.message === 'Cancelled image upload.') return;

          toast({
            title: 'Falha no envio',
            description: 'Ocorreu um erro ao realizar o upload da sua imagem.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsSending(false);
          setProgress(0);
        }
      },
      [onChange, setError, setImageUrl, setLocalImageUrl, trigger, toast]
    );

    useEffect(() => {
      // se deu erro E tem msg de erro E o envio do arq está em andamento E conseguir cancelar
      if (error?.message && isSending && cancelToken?.cancel) {
        cancelToken.cancel('Cancelled image upload.');
        setCancelToken(null);
      }
      // não entendi o cancelToken neste array... ele tbm pode mudar???  
    }, [cancelToken, error, isSending]);

    return (
      <>
        <FormControl
          onClick={() => alert("click0!")}
          isInvalid={!!error}>
          <FormLabel
            mx="auto"
            w={40}
            h={40}
            onClick={() => alert("click1!")}
            htmlFor={name}
            cursor={isSending ? 'progress' : 'pointer'}
            opacity={isSending ? 0.5 : 1}
          >
            {localImageUrl && !isSending ? (
              <Image
                w="full"
                h="full"
                src={localImageUrl}
                alt="Uploaded photo"
                borderRadius="md"
                objectFit="cover"
              />
            ) : (
              <Flex
                w="full"
                h="full"
                flexDir="column"
                justifyContent="center"
                alignItems="center"
                borderRadius="md"
                bgColor="pGray.800"
                color="pGray.200"
                borderWidth={error?.message && 2}
                borderColor={error?.message && 'red.500'}
              >
                {isSending ? (
                  <>
                    <CircularProgress
                      trackColor="pGray.200"
                      value={progress}
                      color="orange.500"
                    >
                      <CircularProgressLabel>{progress}%</CircularProgressLabel>
                    </CircularProgress>
                    <Text as="span" pt={2} textAlign="center">
                      Enviando...
                </Text>
                  </>
                ) : (
                  <Box pos="relative" h="full">
                    {!!error && (
                      <Tooltip label={error.message} bg="red.500">
                        <FormErrorMessage
                          pos="absolute"
                          right={2}
                          top={2}
                          mt={0}
                          zIndex="tooltip"
                        >
                          <Icon as={FiAlertCircle} color="red.500" w={4} h={4} />
                        </FormErrorMessage>
                      </Tooltip>
                    )}

                    <Flex
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      flexDir="column"
                      onClick={() => alert("click!")}
                    >
                      <Icon as={FiPlus} w={14} h={14} />
                      <Text as="span" pt={2} textAlign="center">
                        Adicione sua imagem
                  </Text>
                    </Flex>
                  </Box>
                )}
              </Flex>
            )}

          </FormLabel>
        </FormControl>
        <input
          data-testid={name}
          disabled={isSending}
          id={name}
          name={name}
          onChange={handleImageUpload}
          ref={ref}
          type="file"

          {...rest}
        />
      </>
    );
  };


// qdo se passa a referência, todos os eventos q o componente origem receberia serão
// repassados p quem recebeu o "ref", q neste caso foi o input type=file
export const FileInputClarinha = forwardRef(FileInputBase);

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
  // onChange...
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<boolean | void>;
  // Manually triggers form or input validation
  trigger: UseFormTrigger<FieldValues>;
}

// declaracao do hook useState():
//    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
//
//   Dispatch é só um sinônimo (alias) q significa: "uma função q retorna void"


// componente que vai receber o "ref" do FileInpu, ou seja, vai repassar todos os eventos que
// recebidos para seus componentes internos tratarem, o <FileInput> em si não vai tratar nem 
// receber NENHUM evento, TODOS OS EVENTOS serão repassados para os componentes q estiverem
// dentro do seu método return();
const FileInputBase: ForwardRefRenderFunction<
  // tipo deste componente base é HTMLInputElement
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
  // é este parâmetro q faz com q o <FileInputBase> receba os eventos realizados no <FileInput>
  ref
) => {
    const toast = useToast();

    // armazena o progresso do post da imagem para o site imgbb
    const [progress, setProgress] = useState(0);

    // armazena o estado do envio da imagem para o site imgbb
    const [isSending, setIsSending] = useState(false);

    // armazena o token para cancelamento do post da imagem para o site imgbb
    const [cancelToken, setCancelToken] = useState<CancelTokenSource>(
      {} as CancelTokenSource
    );

    // useCallback() = esta função só será executada na primeira vez q for chamada ou qdo os 
    // parâmetros do array de dependências se alterarem, caso contrário ela retorna um valor 
    // memoizado (cached)
    // 
    // handleImageUpload() = chamado pelo input file qdo o usuário escolhe um arquivo p upload
    const handleImageUpload = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        // se não foi selecionado arquivo, cai fora do método
        if (!event.target.files?.length) {
          return;
        }

        // limpa variárias
        setImageUrl('');
        setLocalImageUrl('');
        setError('image', null);
        setIsSending(true);

        // chama qual função??? se não foi passada a prop onChange na chamada do <FileInput>?
        // só se esta linha for simplesmente aguardar o final da execução do evento onChange q seria
        // o upload do arquivo selecionado no diálogo do file input...
        await onChange(event);
        // se der erro na validação, encerra a execução deste método?
        trigger('image');

        // FormData é uma interface do DOM q tem entradas, chaves e valores
        // cria uma estrutura de dados q simula um form para envio via post
        const formData = new FormData();

        // acrescenta 2 campos na estrutura de dados: arquivo e key (chave do app no imgbb)
        formData.append(event.target.name, event.target.files[0]);
        formData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY);

        // armazena o token de cancelamento do post no estado do componente
        const { CancelToken } = axios;
        const source = CancelToken.source();
        setCancelToken(source);

        // cria estrutura de configuração para chamar o post da imagem no axios
        const config = {
          headers: { 'content-type': 'multipart/form-data' },
          // toda vez q o axios enviar uma parte do arquivo, o percentual do progresso do upload será
          // guardado no estado do componente
          onUploadProgress: (e: ProgressEvent) => {
            setProgress(Math.round((e.loaded * 100) / e.total));
          },
          cancelToken: source.token,
        } as AxiosRequestConfig;

        // faz o post da imagem para o imgbb
        try {
          const response = await api.post(
            'https://api.imgbb.com/1/upload',
            formData,
            config
          );

          // guarda a url onde a imagem foi guardada no imgbb no estado
          setImageUrl(response.data.data.url);
          // para melhorar a performance do app, já q a img está local, no dispositivo do usuário,
          // é mais rápido exibir a img q já está local do q ir buscá-la no imgbb, para isso é 
          // preciso criar uma URL para a img local (muuuuuuuuuuito estranho isso!!!)
          setLocalImageUrl(URL.createObjectURL(event.target.files[0]));
        } catch (err) {
          // se o erro aconteceu porque o usuário clicou no "cancelar", não mostra msg de erro
          // neste caso o useEffect() será executado pq token de cancelamento está no seu array de 
          // dependências
          if (err?.message === 'Cancelled image upload.') return;

          toast({
            title: 'Falha no envio',
            description: 'Ocorreu um erro ao realizar o upload da sua imagem.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          // tenha dado certo ou errado o post da imagem, o isSending passará a ser false e o progresso
          // do post do arquivo será zerado
        } finally {
          setIsSending(false);
          setProgress(0);
        }
      },
      [onChange, setError, setImageUrl, setLocalImageUrl, trigger, toast]
    );

    // se houve erro por cancelamento e o arquivo ainda estava sendo enviado, mostra msg
    useEffect(() => {
      if (error?.message && isSending && cancelToken?.cancel) {
        cancelToken.cancel('Cancelled image upload.');
        setCancelToken(null);
      }
    }, [cancelToken, error, isSending]);

    return (
      <FormControl isInvalid={!!error}>
        <FormLabel
          mx="auto"
          w={40}
          h={40}
          htmlFor={name}
          cursor={isSending ? 'progress' : 'pointer'}
          opacity={isSending ? 0.5 : 1}
        >
          {/* se tem img carregada localmente e não está enviando nada */}
          {localImageUrl && !isSending ? (
            <Image
              w="full"
              h="full"
              // mostra imagem carregada localmente
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
              {/* se está no meio do envio de uma imagem */}
              {isSending ? (
                <>
                  {/* componente do chakra para mostrar progresso de uma operação */}
                  <CircularProgress
                    trackColor="pGray.200"
                    value={progress}
                    color="orange.500"
                  >
                    {/* componente do chakra para mostrar progresso de uma operação */}
                    <CircularProgressLabel>{progress}%</CircularProgressLabel>
                  </CircularProgress>
                  <Text as="span" pt={2} textAlign="center">
                    Enviando...
                </Text>
                </>
              ) : (
                // se não está no meio do envio de uma imagem
                <Box pos="relative" h="full">
                  {/* se DEU erro */}
                  {!!error && (
                    <Tooltip label={error.message} bg="red.500">
                      {/* componente do Chakra UI */}
                      <FormErrorMessage
                        pos="absolute"
                        right={2}
                        top={2}
                        mt={0}
                        zIndex="tooltip"
                      >
                        {/* mostra um ícone de alerta vermelhinho no topo direito do componente */}
                        <Icon as={FiAlertCircle} color="red.500" w={4} h={4} />
                      </FormErrorMessage>
                    </Tooltip>
                  )}

                  {/* se não está no meio do envio de uma imagem e NÃO DEU ERRO */}
                  <Flex
                    h="full"
                    alignItems="center"
                    justifyContent="center"
                    flexDir="column"
                  >
                    {/* mostra ícone "+" e o texto "Adicione sua imagem" */}
                    <Icon as={FiPlus} w={14} h={14} />
                    <Text as="span" pt={2} textAlign="center">
                      Adicione sua imagem
                  </Text>
                  </Flex>
                </Box>
              )}
            </Flex>
          )}
          {/* componente q vai receber o forward da referência para captar e responder aos eventos 
          de click para abrir a janela de diálogo para seleção arquivo e para fazer o upload do 
          arquivo para o app, disparando o evento de change */}
          <input
            data-testid={name}
            disabled={isSending}
            id={name}
            name={name}
            onChange={handleImageUpload}
            ref={ref}
            type="file"
            style={{
              display: 'none',
            }}
            {...rest}
          />
        </FormLabel>
      </FormControl>
    );
  };

// qdo se passa a referência, todos os eventos q o componente origem receberia serão
// repassados p quem recebeu o "ref", q neste caso foi o input type=file
export const FileInput = forwardRef(FileInputBase);

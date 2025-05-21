import {
  FormControl,
  Input as NativeBaseInput,
  IInputProps,
  Text,
} from 'native-base'

type Props = IInputProps & {
  errorMessage?: string
}

export function Input({ errorMessage, isInvalid, ...rest }: Props) {
  const invalid = !!errorMessage || isInvalid

  return (
    <FormControl isInvalid={invalid} mb={3}>
      <NativeBaseInput
        bg="gray.100"
        borderWidth={0}
        fontSize="md"
        h={12}
        _focus={{
          bg: 'gray.100',
          borderWidth: 1,
          borderColor: 'green.500',
        }}
        isInvalid={invalid}
        {...rest}
      />
      {errorMessage && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {errorMessage}
        </Text>
      )}
    </FormControl>
  )
}

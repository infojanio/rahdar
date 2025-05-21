import { Input as NBInput, IInputProps, Icon } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'

type Props = IInputProps & {
  iconName?: keyof typeof MaterialIcons.glyphMap
}

export function Input({ iconName, ...rest }: Props) {
  return (
    <NBInput
      bg="gray.100"
      h={12}
      px={4}
      borderWidth={0}
      fontSize="md"
      color="gray.700"
      placeholderTextColor="gray.400"
      _focus={{
        bg: 'gray.100',
        borderWidth: 1,
        borderColor: 'green.500',
      }}
      InputLeftElement={
        iconName ? (
          <Icon
            as={<MaterialIcons name={iconName} />}
            size={5}
            ml={2}
            color="gray.400"
          />
        ) : undefined
      }
      {...rest}
    />
  )
}

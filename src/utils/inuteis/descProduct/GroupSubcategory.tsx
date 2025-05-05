/*
import { Box, FlatList, VStack } from 'native-base'

import { Group } from '@components/Product/Group'
import { SubcategoryList } from '../../data/subcategory'

type Props = {
  onSelect: (value: string) => void
  selected: string
}

export function GroupSubCategory({ onSelect, selected }: Props) {
  return (
    <VStack>
      <FlatList
        data={SubcategoryList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Group
            name={item.title}
            isActive={selected === item.title}
            onPress={() => onSelect(item.title)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8 }}
        mt={8}
        maxH={16}
        minH={16}
      />
    </VStack>
  )
}

*/

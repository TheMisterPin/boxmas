import { InboxIcon } from 'lucide-react'

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Location } from '@/types'

export function LocationCard(location : Location) {
  return (

    <Item variant="outline">
      <ItemMedia variant="icon">
        <InboxIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{location.name}</ItemTitle>
      </ItemContent>
    </Item>

  )
}

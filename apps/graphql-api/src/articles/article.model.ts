import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Article {
  @Field()
  title: string

  @Field()
  content: string

  @Field()
  author: string
}

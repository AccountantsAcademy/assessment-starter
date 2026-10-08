import { Query, Resolver } from '@nestjs/graphql'
import { Article } from './article.model'
import { ArticlesService } from './articles.service'

@Resolver()
export class ArticlesResolver {
  constructor(private readonly articlesService: ArticlesService) {}

  @Query(() => [Article])
  async articles() {
    return this.articlesService.findAll()
  }
}

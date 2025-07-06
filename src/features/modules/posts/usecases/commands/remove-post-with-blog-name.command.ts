export class RemovePostWithBlogNameCommand {
  constructor(
    public readonly postId: string,
    public readonly blogId: string,
  ) {}
}

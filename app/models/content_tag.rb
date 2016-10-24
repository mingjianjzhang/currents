class ContentTag < ActiveRecord::Base
  belongs_to :content_node
  belongs_to :tag
end

ContentTag.create(content_node: ContentNode.find(5), tag: Tag.find(3))
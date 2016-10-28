class ContentTag < ActiveRecord::Base
  belongs_to :content_node
  belongs_to :tag

  def self.add_tags content_node_id, tags
  	
  	tags.each do |tag|
  	  self.create(content_node_id: content_node_id, tag_id: tag)
  	end
  end
end


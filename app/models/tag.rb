class Tag < ActiveRecord::Base
	has_many :content_tags
	has_many :content_nodes, through: :content_tags
end

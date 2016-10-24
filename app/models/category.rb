class Category < ActiveRecord::Base
	has_many :content_nodes
end

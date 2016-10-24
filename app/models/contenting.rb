class Contenting < ActiveRecord::Base
  belongs_to :content_node
  belongs_to :contentable
end

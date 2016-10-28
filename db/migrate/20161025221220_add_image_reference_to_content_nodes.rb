class AddImageReferenceToContentNodes < ActiveRecord::Migration
  def change
    add_reference :content_nodes, :image, index: true
    add_foreign_key :content_nodes, :images
  end
end

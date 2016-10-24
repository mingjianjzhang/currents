class AddSourceRefToContentNodes < ActiveRecord::Migration
  def change
    add_reference :content_nodes, :source, index: true
    add_foreign_key :content_nodes, :sources
  end
end

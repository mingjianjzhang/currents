class CreateTimelineContents < ActiveRecord::Migration
  def change
    create_table :timeline_contents do |t|
      t.references :content_node, index: true
      t.references :timeline, index: true

      t.timestamps null: false
    end
    add_foreign_key :timeline_contents, :content_nodes
    add_foreign_key :timeline_contents, :timelines
  end
end

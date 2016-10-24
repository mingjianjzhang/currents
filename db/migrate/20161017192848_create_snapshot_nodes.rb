class CreateSnapshotNodes < ActiveRecord::Migration
  def change
    create_table :snapshot_nodes do |t|
      t.references :content_node, index: true
      t.references :snapshot, index: true

      t.timestamps null: false
    end
    add_foreign_key :snapshot_nodes, :content_nodes
    add_foreign_key :snapshot_nodes, :snapshots
  end
end

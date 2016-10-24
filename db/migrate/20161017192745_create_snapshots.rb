class CreateSnapshots < ActiveRecord::Migration
  def change
    create_table :snapshots do |t|
      t.string :title
      t.references :timeline, index: true
      t.date :day
      t.string :type

      t.timestamps null: false
    end
    add_foreign_key :snapshots, :timelines
  end
end
